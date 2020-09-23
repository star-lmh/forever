package com.manage.modular.system.pojo;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.util.Date;

@Data
@NoArgsConstructor
@Table(name="tb_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String password;
    private String salt;
    private String name;
    private String sex;
    private String photo;
    private String cellphone;
    private String email;
    private Integer state;
    private String code;
    private Date createTime;
    private String isDelete;

}
