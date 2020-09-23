package com.manage.modular.system.pojo;

import lombok.Data;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.util.Date;

/**
 * 权限实体
 *
 * @author LiMengHui
 * @Date 2020/5/23
 */
@Data
@Table(name = "tb_permission")
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long parentId;
    private String name;
    private String type;
    private String code;
    private String icon;
    private String url;
    private String menuOrder;
    private String btnClass;
    private String btnStatus;
    private String apiLevel;
    private String apiMethod;
    private String description;
    private String isVisible;
    private String externalOpen;
    private Date createTime;
    private String isDelete;
}
