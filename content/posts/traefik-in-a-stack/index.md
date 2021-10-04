---
title: "Traefik in a stack"
description: "Recently I used Traefik within a project as the loadbalancer in my stack. This post should provide you a short overview how I implemented and configured Traefik"
tags:
  - docker
  - docker-compose
  - swarm
  - traefik
  - go
categories:
  - traefik
date: 2021-10-01T23:26:28+02:00
draft: true
---

For the last project at work I used Traefik as the entrypoint for the whole stack within Docker. It totally would make sense to use an api gateway in this case but Traefik does the job quite nice and is easy to spin up within the stack. This is the reason why I wrote this article to show you how Traefik is configured in this scenario.

# Overview

This is a simple overview of the stack.

Three services are customer faced and one is only reachable within the stack. The one service that is only reachable internally is used to check if the given app token on each request is valid. Yes, nearly every endpoint is protected by an app token.
