package com.manage.config.shiro;

import com.manage.common.util.ShiroUtils;
import com.manage.modular.system.pojo.User;
import com.manage.modular.system.service.UserService;
import org.apache.shiro.authc.*;
import org.apache.shiro.authc.credential.CredentialsMatcher;
import org.apache.shiro.authc.credential.HashedCredentialsMatcher;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

public class CustomRealm extends AuthorizingRealm {

    private Logger logger = LoggerFactory.getLogger(CustomRealm.class);

    @Autowired
    private UserService userService;

    /**
     * 授权
     * @param principals
     * @return
     */
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
        return null;
    }

    /**
     * 认证
     * @param token
     * @return
     * @throws AuthenticationException
     */
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
        // 加这一步的目的是在Post请求的时候会先进认证，然后再到请求
        if (token.getPrincipal() == null) {
            return null;    // shiro底层会抛出UnKnowAccountException
        }
        UsernamePasswordToken upToken = (UsernamePasswordToken) token;
        String username = upToken.getUsername();
        String password = new String(upToken.getPassword());
        User user = this.userService.getUserByUsername(username);
        if (user != null) {
            if (password.equals(user.getPassword())) {
                return new SimpleAuthenticationInfo(user, user.getPassword(), this.getName());
            }
            logger.error("密码错误！");
            throw new IncorrectCredentialsException();
        }
        logger.warn("用户名{}不存在！", username);
        return null;
    }

    @Override
    public void setCredentialsMatcher(CredentialsMatcher credentialsMatcher) {
        HashedCredentialsMatcher md5CredentialsMatcher = new HashedCredentialsMatcher();
        md5CredentialsMatcher.setHashAlgorithmName(ShiroUtils.hashAlgorithmName);
        md5CredentialsMatcher.setHashIterations(ShiroUtils.hashIterations);
        super.setCredentialsMatcher(credentialsMatcher);
    }
}
