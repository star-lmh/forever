package com.manage.modular.system.service;

import com.manage.modular.system.pojo.Permission;
import com.manage.modular.system.pojo.User;

import java.util.List;
import java.util.Set;

public interface PermissionService {
    Set<String> getPermissionByUserId(String userId);

    String getMenuListByUser(User user);

    List<Permission> getMenuPermissionsByUserId(String userId, Long id);

    List<Permission> getMenuListByPid(Long i);
}
