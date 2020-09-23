package com.manage.modular.system.mapper;

import com.manage.modular.system.pojo.User;
import org.apache.ibatis.annotations.Select;
import tk.mybatis.mapper.common.Mapper;

public interface UserMapper extends Mapper<User> {

    @Select("select * from tb_user where username = #{username}")
    User getUserByUsername(String username);
}
