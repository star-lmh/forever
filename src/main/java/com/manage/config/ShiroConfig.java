package com.manage.config;

import com.manage.config.shiro.CustomFormAuthenticationFilter;
import com.manage.config.shiro.CustomRealm;
import com.manage.config.shiro.CustomSessionListener;
import com.manage.config.shiro.RetryLimitMatcher;
import org.apache.shiro.cache.CacheManager;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.session.SessionListener;
import org.apache.shiro.spring.security.interceptor.AuthorizationAttributeSourceAdvisor;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.apache.shiro.web.servlet.Cookie;
import org.apache.shiro.web.servlet.ShiroHttpSession;
import org.apache.shiro.web.servlet.SimpleCookie;
import org.apache.shiro.web.session.mgt.DefaultWebSessionManager;
import org.crazycake.shiro.RedisCacheManager;
import org.crazycake.shiro.RedisManager;
import org.crazycake.shiro.RedisSessionDAO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import javax.servlet.Filter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class ShiroConfig {

    @Value("${spring.redis.host}")
    private String host;

    @Value("${spring.redis.port}")
    private int port;

    /**
     * 自定义Realm
     * @return
     */
    @Bean
    public CustomRealm getRealm(){
        return new CustomRealm();
    }

    /**
     * 安全管理器
     * @param customRealm
     * @return
     */
    @Bean
    public SecurityManager getSecurityManager(CustomRealm customRealm){
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager(customRealm);
        return securityManager;
    }

    /**
     * web 过滤器链
     * @param securityManager
     * @return
     */
    @Bean
    public ShiroFilterFactoryBean filterFactory(SecurityManager securityManager){
        ShiroFilterFactoryBean filterFactory = new ShiroFilterFactoryBean();
        filterFactory.setSecurityManager(securityManager);
        // 过滤器
        Map<String, Filter> filters = filterFactory.getFilters();
        // 自定义过滤器
        filters.put("authc", new CustomFormAuthenticationFilter());
        filterFactory.setFilters(filters);
        Map<String, String> filterMap = new HashMap<>();
        filterMap.put("/**/*.*", "anon");
        filterMap.put("/kaptcha", "anon");
        filterMap.put("/register", "anon");
        //filterChainDefinitionMap.put("/static/**", "anon");
        //配置退出 过滤器,其中的具体的退出代码Shiro已经替我们实现了
        filterMap.put("/logout", "anon");
        filterMap.put("/login", "authc");
        //<!-- 过滤链定义，从上向下顺序执行，一般将/**放在最为下边 -->:这是一个坑呢，一不小心代码就不好使了;
        //<!-- authc:所有url都必须认证通过才可以访问; anon:所有url都都可以匿名访问-->
        filterMap.put("/**", "user");
        filterFactory.setFilterChainDefinitionMap(filterMap);
        filterFactory.setLoginUrl("/login");
        filterFactory.setUnauthorizedUrl("/go403");
//        filterFactory.setSuccessUrl("/index");
        return filterFactory;
    }

    /**
     * redis 的控制器，操作redis
     * @return
     */
    @Bean
    public RedisManager redisManager() {
        RedisManager redisManager = new RedisManager();
        JedisPool jedis = new JedisPool(host, port);
        redisManager.setJedisPool(jedis);
        return redisManager;
    }

    /**
     * sessionDAO
     * @return
     */
    @Bean
    public RedisSessionDAO redisSessionDAO(){
        RedisSessionDAO sessionDAO = new RedisSessionDAO();
        sessionDAO.setRedisManager(redisManager());
        return sessionDAO;
    }

    /**
     * 会话管理器
     * @return
     */
    @Bean
    public DefaultWebSessionManager sessionManager() {
        DefaultWebSessionManager sessionManager = new DefaultWebSessionManager();
        sessionManager.setSessionDAO(redisSessionDAO());
        sessionManager.setCacheManager(cacheManager());
        List<SessionListener> listeners = new ArrayList<>();
        // 实现自定义的session监听器
        listeners.add(new CustomSessionListener());
        sessionManager.setSessionListeners(listeners);
        // 相隔多久检查一次session的有效性
        sessionManager.setSessionValidationInterval(1800000);
        // session的失效时长，单位为毫秒
        sessionManager.setGlobalSessionTimeout(1800000);
        // 删除失效的session
        sessionManager.setDeleteInvalidSessions(true);
        // 是否开启session的失效检测，默认开启
        sessionManager.setSessionValidationSchedulerEnabled(true);
        Cookie cookie = new SimpleCookie(ShiroHttpSession.DEFAULT_SESSION_ID_NAME);
        cookie.setName("shiroCookie");
        cookie.setHttpOnly(true);
        sessionManager.setSessionIdCookie(cookie);
        return sessionManager;
    }

    /**
     * 缓存管理器
     * @return
     */
    @Bean
    public RedisCacheManager cacheManager(){
        RedisCacheManager cacheManager = new RedisCacheManager();
        cacheManager.setRedisManager(redisManager());
        return cacheManager;
    }



    /**
     * 开启shiro aop注解支持.
     * 使用代理方式;所以需要开启代码支持;
     * @param securityManager
     * @return
     */
    @Bean
    public AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor(SecurityManager securityManager) {
        AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor = new AuthorizationAttributeSourceAdvisor();
        authorizationAttributeSourceAdvisor.setSecurityManager(securityManager);
        return authorizationAttributeSourceAdvisor;
    }

    /**
     * 登录失败次数过多工具
     */
    @Bean
    public RetryLimitMatcher retryLimitMatcher(RedisCacheManager cacheManager){
        RetryLimitMatcher retryLimitMatcher = new RetryLimitMatcher(cacheManager);
        return retryLimitMatcher;
    }

}
