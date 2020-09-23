package com.manage.modular.system.mapper;

import com.manage.modular.system.pojo.Permission;
import org.apache.ibatis.annotations.Param;
import tk.mybatis.mapper.common.Mapper;

import java.util.List;

public interface PermissionMapper extends Mapper<Permission> {

    List<Permission> getPermissionByUserId(String userId);

    List<Permission> getMenuPermissionsByUserId(@Param("userId") String userId, @Param("id") Long id);
}
