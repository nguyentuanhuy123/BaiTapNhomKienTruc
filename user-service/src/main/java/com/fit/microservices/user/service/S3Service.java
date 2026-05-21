package com.fit.microservices.user.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface S3Service {
    String uploadAvatar(MultipartFile file, Long userId) throws IOException;
    void deleteIfBucketUrl(String avatarUrl);
}
