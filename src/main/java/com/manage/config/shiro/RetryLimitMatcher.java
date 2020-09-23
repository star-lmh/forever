package com.manage.config.shiro;

import org.apache.shiro.cache.Cache;
import org.apache.shiro.cache.CacheManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.atomic.AtomicInteger;

public class RetryLimitMatcher {

	Logger log = LoggerFactory.getLogger(RetryLimitMatcher.class);
	
	 private Cache<String, AtomicInteger> passwordRetryCache;
	 
	    public RetryLimitMatcher(CacheManager cacheManager) {
	        passwordRetryCache = cacheManager.getCache("passwordRetryCache");
	    }
	 
	    public void doLimitMatch(String username) {
	        AtomicInteger retryCount = passwordRetryCache.get(username);
	        if(retryCount == null) {
	            retryCount = new AtomicInteger(0);
	            passwordRetryCache.put(username, retryCount);
	        }
	        retryCount.incrementAndGet();
	        passwordRetryCache.put(username,retryCount);
	        log.warn("用户{}登录失败,次数{}",username,retryCount.intValue());
	    }
	 
	    public boolean isLocked(String username){
	        AtomicInteger num = passwordRetryCache.get(username);
	        if(null != num && num.intValue() > 4){
	        	log.warn("用户{}账户被锁定",username);
	            return true;
	        }
	        log.warn("用户{}登录次数{}",username,num!=null ? num.intValue() : "0");
	        return false;
	    }
	 
	    public int getRetaryNum(String username){
	        AtomicInteger num = passwordRetryCache.get(username);
	        if(null == num){
	            return 5;
	        }
	        return 5 - num.intValue();
	    }
	 
	 
	    public void removeRetary(String username){
	        passwordRetryCache.remove(username);
	    }   
    
}
