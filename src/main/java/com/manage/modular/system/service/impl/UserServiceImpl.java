package com.manage.modular.system.service.impl;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.manage.common.result.JSONRuselt;
import com.manage.modular.system.mapper.UserMapper;
import com.manage.modular.system.pojo.User;
import com.manage.modular.system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public User getUserByUsername(String username) {
        return this.userMapper.getUserByUsername(username);
    }

    @Override
    public JSONRuselt queryUserList(Integer page, Integer limit, User user) {
        // 分页
        PageHelper.startPage(page, limit);
        // 查询
        List<User> users = this.userMapper.select(user);
        PageInfo pageInfo = new PageInfo(users);
        return new JSONRuselt(pageInfo.getTotal(), pageInfo.getList());
    }
}
