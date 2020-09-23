package com.manage.modular.system.service;

import com.manage.common.result.JSONRuselt;
import com.manage.modular.system.pojo.User;

public interface UserService {
    User getUserByUsername(String username);

    JSONRuselt queryUserList(Integer page, Integer limit, User field);
}
