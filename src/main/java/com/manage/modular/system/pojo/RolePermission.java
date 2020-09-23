package com.manage.modular.system.pojo;

import lombok.Data;

import javax.persistence.Table;
import java.util.Date;

/**
 * 角色菜单中间表
 *
 * @author LiMengHui
 * @Date 2020/5/23
 */
@Data
@Table(name = "tb_role_permission")
public class RolePermission {

    private Role role;
    private Permission perm;
    private Date createTime;

}
