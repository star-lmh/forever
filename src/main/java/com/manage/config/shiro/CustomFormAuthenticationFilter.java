package com.manage.config.shiro;

import com.google.code.kaptcha.Constants;
import com.manage.modular.system.pojo.User;
import org.apache.commons.lang.StringUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.LockedAccountException;
import org.apache.shiro.session.Session;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.web.filter.authc.FormAuthenticationFilter;
import org.apache.shiro.web.session.mgt.DefaultWebSessionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collection;

public class CustomFormAuthenticationFilter extends FormAuthenticationFilter{

    private Logger log = LoggerFactory.getLogger(CustomFormAuthenticationFilter.class);

    private RetryLimitMatcher matcher = null;

    @Override
    protected boolean onAccessDenied(ServletRequest request, ServletResponse response) throws Exception {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        // 判断当前请求 URL 是否为/login
        if( this.isLoginRequest(request, response) ){
            // 判断当前请求方式是否为 POST
            if(this.isLoginSubmission(request, response)){
                String verity = httpServletRequest.getParameter("verity");
                String code = (String)httpServletRequest.getSession().getAttribute(Constants.KAPTCHA_SESSION_KEY);
                log.info("verity:{}, {}",verity, code);
                if(StringUtils.isBlank(code) || StringUtils.isBlank(verity) || !verity.trim().equals(code)){
                    httpServletRequest.setAttribute("shiroLoginFailure", "kaptchaValidateFailed");//自定义登录异常
                    this.onLoginFailure(null, null, request, response);
                    return false;
                }
                return this.executeLogin(request, response);
            }else{
                return true;
            }

        }else{
            this.saveRequestAndRedirectToLogin(request, response);
            return false;
        }
    }

    @Override
    protected boolean executeLogin(ServletRequest request, ServletResponse response) throws Exception {
        AuthenticationToken token = createToken(request, response);
        if (token == null) {
            String msg = "createToken method implementation returned null. A valid non-null AuthenticationToken " +
                    "must be created in order to execute a login attempt.";
            throw new IllegalStateException(msg);
        }
        //是否锁定，个人认为与自动注入是一个意思，由于该过滤器交由shiro管理，所以此处需要手动获取bean
        matcher = SpringContextHolder.getBean(RetryLimitMatcher.class);
        if(matcher.isLocked((String)token.getPrincipal())){
            return onLoginFailure(token, new LockedAccountException(), request, response);
        }

        try {
            Subject subject = getSubject(request, response);
            subject.login(token);
            User user = (User) subject.getPrincipal();
            HttpServletRequest req = (HttpServletRequest) request;
            req.getSession().setAttribute("user", user);
            return onLoginSuccess(token, subject, request, response);
        } catch (AuthenticationException e) {
            return onLoginFailure(token, e, request, response);
        }
    }

    /**
     * 当登录成功
     * @param token
     * @param subject
     * @param request
     * @param response
     * @return
     * @throws Exception
     */
    @Override
    protected boolean onLoginSuccess(AuthenticationToken token, Subject subject, ServletRequest request, ServletResponse response) throws Exception {

        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        HttpServletResponse httpServletResponse = (HttpServletResponse) response;

        matcher.removeRetary((String)token.getPrincipal());

        clearLoginedSession(subject);

        if (!"XMLHttpRequest".equalsIgnoreCase(httpServletRequest
                .getHeader("X-Requested-With"))) {// 不是ajax请求
            issueSuccessRedirect(request, response);
        }
        else {
            httpServletResponse.setCharacterEncoding("UTF-8");
            PrintWriter out = httpServletResponse.getWriter();
            out.println("{\"success\":true,\"message\":\"登入成功\"}");
            out.flush();
            out.close();
        }


        return false;
    }

    /**
     * 当登录失败
     * @param token
     * @param e
     * @param request
     * @return
     * @param response
     */
    @Override
    protected boolean onLoginFailure(AuthenticationToken token, AuthenticationException e, ServletRequest request, ServletResponse response) {
        // ajax 最核心的依赖就是浏览器提供的 XMLHttpRequest 对象
        if (!"XMLHttpRequest".equalsIgnoreCase(((HttpServletRequest) request)
                .getHeader("X-Requested-With"))) {// 不是ajax请求
            setFailureAttribute(request, e);
            return true;
        }
        String exception =  (String) request.getAttribute("shiroLoginFailure");

        try {
            response.setCharacterEncoding("UTF-8");
            PrintWriter out = response.getWriter();
            if(exception!=null && "kaptchaValidateFailed".equals(exception)){
                out.println("{\"success\":false,\"message\":\"验证码错误\"}");
            }else{
                String message = e.getClass().getSimpleName();
                if ("IncorrectCredentialsException".equals(message)) {
                    matcher = SpringContextHolder.getBean(RetryLimitMatcher.class);
                    matcher.doLimitMatch((String)token.getPrincipal());
                    if(matcher.isLocked((String)token.getPrincipal())){
                        out.println("{\"success\":false,\"message\":\"账户被锁定\"}");
                    }else
                        out.println("{\"success\":false,\"message\":\"用户名或密码错误\"}");
                } else if ("UnknownAccountException".equals(message)) {
                    out.println("{\"success\":false,\"message\":\"用户名或密码错误\"}");
                } else if ("LockedAccountException".equals(message)) {
                    out.println("{\"success\":false,\"message\":\"账号被锁定\"}");
                } else {
                    out.println("{\"success\":false,\"message\":\"未知错误\"}");
                }
            }
            out.flush();
            out.close();
        } catch (IOException e1) {
            e1.printStackTrace();
        }
        return false;
    }

    /**
     * @param currentUser
     * @return
     */
    private void clearLoginedSession(Subject currentUser){

        DefaultWebSessionManager webSessionManager = SpringContextHolder.getBean(DefaultWebSessionManager.class);

        Collection<Session> list = webSessionManager.getSessionDAO().getActiveSessions();
        User loginuser = (User) currentUser.getPrincipal();
        for(Session session: list){
            Subject s = new Subject.Builder().session(session).buildSubject();
            User user = (User) s.getPrincipal();
            if(user!=null){
                log.info("已登录的用户:{},sessionId:{}",user.getName(),session.getId());
                if(loginuser.getUsername().equalsIgnoreCase(user.getUsername())){
                    if(!session.getId().equals(currentUser.getSession().getId())){
                        webSessionManager.getSessionDAO().delete(session);
                        log.info("登出用户{}",session.getId());
                    }
                }
            }

        }
    }

}
