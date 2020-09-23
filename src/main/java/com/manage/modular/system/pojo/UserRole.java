package com.manage.modular.system.pojo;

import lombok.Data;

import javax.persistence.Table;
import java.util.Date;

/**
 * 用户角色表
 *
 * @author LiMengHui
 * @Date 2020/5/23
 */
@Data
@Table(name = "tb_user_role")
public class UserRole {
    private User user;
    private Role role;
    private Date createTime;

}
