package com.manage.config.shiro;

import org.apache.shiro.session.Session;
import org.apache.shiro.session.SessionListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 自定义的会话监听
 *
 * @author LiMengHui
 * @Date 2020/5/24
 */
public class CustomSessionListener implements SessionListener {

    private Logger logger = LoggerFactory.getLogger(CustomSessionListener.class);

    @Override
    public void onStart(Session session) {
        logger.info("创建session");
    }

    @Override
    public void onStop(Session session) {
        logger.info("销毁session");
    }

    @Override
    public void onExpiration(Session session) {
        logger.info("session过期");
    }
}
