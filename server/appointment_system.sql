-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: localhost    Database: appointment_system
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `courseId` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `topic` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `status` enum('Pending','Approved','Rejected','Completed') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `description` text COLLATE utf8mb4_unicode_ci,
  `trainerId` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `meetingLink` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rejectionReason` text COLLATE utf8mb4_unicode_ci,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_appt_user` (`userId`),
  KEY `fk_appt_course` (`courseId`),
  KEY `fk_appt_trainer` (`trainerId`),
  CONSTRAINT `fk_appt_course` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_appt_trainer` FOREIGN KEY (`trainerId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_appt_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES ('req-1771437803390','4','c1','basics','2026-02-19','10:45:00','Approved','qwfe','3',60,'https://meet.google.com/gzt-jobi-xmc',NULL,'2026-02-18 18:03:23');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_enrollments`
--

DROP TABLE IF EXISTS `course_enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_enrollments` (
  `courseId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enrolledAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`courseId`,`studentId`),
  KEY `fk_enroll_student` (`studentId`),
  CONSTRAINT `fk_enroll_course` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enroll_student` FOREIGN KEY (`studentId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_enrollments`
--

LOCK TABLES `course_enrollments` WRITE;
/*!40000 ALTER TABLE `course_enrollments` DISABLE KEYS */;
INSERT INTO `course_enrollments` VALUES ('c1','4','2026-02-18 17:15:09');
/*!40000 ALTER TABLE `course_enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `duration` int DEFAULT NULL,
  `status` enum('Active','Draft','Inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `trainerId` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `schedule` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_course_trainer` (`trainerId`),
  CONSTRAINT `fk_course_trainer` FOREIGN KEY (`trainerId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES ('1771509965297','Basics','Beginner','it covers the basic letter, alphabets and numbers in french',60,'Active','https://images.unsplash.com/photo-1523050335392-995cd0065798?q=80&w=2070&auto=format&fit=crop',NULL,'3','Wed - 10:45'),('c1','French Essentials A1','A1','Master the basics of French conversation and grammar for everyday use.',60,'Active',NULL,NULL,'3','Mon, Wed 10:00 AM'),('c2','Intermediate Fluency B1','B1','Express yourself fluently in various professional and social situations.',90,'Active',NULL,NULL,'3','Tue, Thu 02:00 PM'),('c3','Advanced Mastery C1','C1','Reach complete academic and professional proficiency in the French language.',120,'Active',NULL,NULL,'3','Fri 11:00 AM');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_requests` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Pending','Approved','Rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `reviewedBy` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_leave_user` (`userId`),
  CONSTRAINT `fk_leave_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiverId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('sent','delivered','read') COLLATE utf8mb4_unicode_ci DEFAULT 'sent',
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_msg_sender` (`senderId`),
  KEY `fk_msg_receiver` (`receiverId`),
  CONSTRAINT `fk_msg_receiver` FOREIGN KEY (`receiverId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_msg_sender` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES ('msg-1771437879721','2','3','you have class at the tomorrow','sent','2026-02-18 18:04:39'),('msg-1771437894615','2','3','neeku class vundhi','sent','2026-02-18 18:04:54'),('msg-1771437915803','2','3','ergerg','sent','2026-02-18 18:05:15'),('msg-1771437918573','2','3','ere','sent','2026-02-18 18:05:18'),('msg-1771437919131','2','3','erger','sent','2026-02-18 18:05:19'),('msg-1771437919393','2','3','fef','sent','2026-02-18 18:05:19'),('msg-1771437919653','2','3','r','sent','2026-02-18 18:05:19'),('msg-1771437919861','2','3','ef','sent','2026-02-18 18:05:19'),('msg-1771437920073','2','3','e','sent','2026-02-18 18:05:20'),('msg-1771437920295','2','3','ef','sent','2026-02-18 18:05:20'),('msg-1771437920498','2','3','efef','sent','2026-02-18 18:05:20'),('msg-1771437931740','2','4','efef','sent','2026-02-18 18:05:31'),('msg-1771482432582','4','2','hello sir i wanna change the session class','sent','2026-02-19 06:27:12'),('msg-1771484345945','1771483716167','3','hii  praveen','sent','2026-02-19 06:59:05'),('msg-1771484349625','1771483716167','3','how are you','sent','2026-02-19 06:59:09'),('msg-1771484372372','3','1771483716167','heyy how are jannu','sent','2026-02-19 06:59:32'),('msg-1771484378571','3','1771483716167','im good what about you','sent','2026-02-19 06:59:38'),('msg-1771484746271','2','1771483716167','welcome to TS','sent','2026-02-19 07:05:46'),('msg-1771509852051','4','3','hii raa','sent','2026-02-19 14:04:12'),('msg-1771510105396','1771483716167','3','nenu nenu premisthunanu praveen','sent','2026-02-19 14:08:25');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('info','success','warning','error') COLLATE utf8mb4_unicode_ci DEFAULT 'info',
  `category` enum('system','enrollment','message','meeting','appointment','timesheet','leave') COLLATE utf8mb4_unicode_ci NOT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notif_user` (`userId`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES ('01567e3f-1aea-4c8d-9348-bb9b9b9fa517','4','❌ Leave Request Rejected','Your leave request from 2026-02-19T18:30:00.000Z to 2026-02-19T18:30:00.000Z has been rejected. Comments: why you need , class ki velli denguu','error','leave',0,'2026-02-19 09:04:53'),('05a60c21-bab1-4def-88d8-7509e2c1aa7f','3','✅ Timesheet Approved','Your timesheet entry for introduction (2h on 2026-02-20) has been approved','success','timesheet',0,'2026-02-19 08:14:58'),('15045bde-0fdf-4418-98dc-9afc5e52e394','4','✅ Leave Request Authorized','Your leave request for 2026-02-19T18:30:00.000Z has been approved by Instructor Praveen. Comments: evvanu denge','success','leave',0,'2026-02-19 09:16:54'),('3a27a3eb-f23a-42d3-8227-d0555c288832','4','✅ Leave Request Approved','Your leave request from 2026-02-19T18:30:00.000Z to 2026-02-19T18:30:00.000Z has been approved','success','leave',0,'2026-02-19 09:18:58'),('672fff1f-28f0-4fa6-96db-101ab076aeec','4','✅ Leave Request Approved','Your leave request from 2026-02-19T18:30:00.000Z to 2026-02-19T18:30:00.000Z has been approved. Comments: ook go','success','leave',0,'2026-02-19 09:18:46'),('68bde2d4-ca7e-4eae-a970-92e20715e18f','4','✅ Leave Request Authorized','Your leave request for 2026-02-19T18:30:00.000Z has been approved by Instructor Praveen.','success','leave',0,'2026-02-19 09:23:45'),('c29abe3e-e1f1-472a-98a9-923c9834b0e9','2','New Student Registration','normal (normaluse033@gmail.com) has registered as a student','info','system',0,'2026-02-19 14:09:40'),('cea38055-b9d6-44e8-b9c1-897432066205','3','✅ Timesheet Approved','Your timesheet entry for class (5h on 2026-02-18) has been approved','success','timesheet',0,'2026-02-18 18:03:58'),('fe0f74d3-892b-4118-8174-a40a3340ebae','1','New Student Registration','normal (normaluse033@gmail.com) has registered as a student','info','system',0,'2026-02-19 14:09:40');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('superadmin','admin','trainer','student') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `joinedDate` date DEFAULT NULL,
  `performanceScore` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('1','Super Admin','superadmin@test.com','admin123','superadmin','Active','2026-01-01',0),('1771483716167','Jannu','jannu33@gmail.com','123456789','student','Active','2026-02-19',0),('2','Admin Support','itsupport@technosprint.net','Poland@01','admin','Active','2026-01-01',0),('3','Praveen','praveendommeti333@gmail.com','Praveen123','trainer','Active','2026-01-01',0),('4','Gowtham','bhaskardares@gmail.com','student123','student','Active','2026-01-01',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

--
-- Table structure for table `materials`
--

DROP TABLE IF EXISTS `materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materials` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('PDF','Video','Audio') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Dump completed on 2026-02-19 22:21:36
