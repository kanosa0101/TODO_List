package com.todo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class SchedulingConfig {
    // 启用Spring定时任务调度
    // 这将允许@Scheduled注解的方法按照配置的时间自动执行
}
