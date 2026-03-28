---
tags: [ApachePOI, Language, Java, String]
title: Java中的String&StringBuilder&StringBuffer
date created: 2024-09-09 07:35:45
date modified: 2026-03-27 07:11:15
---

# Java中的String&StringBuilder&StringBuffer

| 场景             | 推荐类                          | 原因             |
| -------------- | ---------------------------- | -------------- |
| 字符串值不需要修改      | String                       | 简单、高效          |
| 单线程环境下，频繁修改字符串 | StringBuilder                | 性能高            |
| 多线程环境下，频繁修改字符串 | StringBuffer                 | 线程安全           |
| 构建大字符串         | StringBuilder 或 StringBuffer | 性能优于 String 连接 |
