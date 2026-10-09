-- MySQL dump 10.13  Distrib 8.0.46, for Linux (aarch64)
--
-- Host: localhost    Database: job_portal_db
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `candidates`
--

DROP TABLE IF EXISTS `candidates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidates` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `headline` varchar(255) DEFAULT NULL,
  `summary` text,
  `currentTitle` varchar(150) DEFAULT NULL,
  `experienceYears` int NOT NULL DEFAULT '0',
  `expectedSalary` decimal(12,2) DEFAULT NULL,
  `resumeUrl` varchar(500) DEFAULT NULL,
  `resumeParsedText` longtext,
  `skills` json DEFAULT NULL,
  `visibility` enum('PUBLIC','ANONYMOUS','PRIVATE') NOT NULL DEFAULT 'PUBLIC',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `experience` json DEFAULT NULL,
  `education` json DEFAULT NULL,
  `certifications` json DEFAULT NULL,
  `projects` json DEFAULT NULL,
  `languages` json DEFAULT NULL,
  `socialLinks` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_94a5fe85e7f5bd0221fa7d6f19` (`user_id`),
  UNIQUE KEY `REL_94a5fe85e7f5bd0221fa7d6f19` (`user_id`),
  CONSTRAINT `FK_94a5fe85e7f5bd0221fa7d6f19c` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidates`
--

LOCK TABLES `candidates` WRITE;
/*!40000 ALTER TABLE `candidates` DISABLE KEYS */;
INSERT INTO `candidates` VALUES ('4148109f-c29f-4913-9c97-b39d76783463','fec2474b-2956-4e02-ad92-db25a44cf6af','Senior Full Stack Engineer | Next.js & NestJS Expert','Passionate developer with 6+ years building enterprise web applications, microservices, and design systems.','Senior Full Stack Developer',6,160000.00,'https://example.com/resumes/john-doe-resume.pdf',NULL,'[\"TypeScript\", \"Next.js\", \"NestJS\", \"React\", \"Tailwind CSS\", \"TypeORM\", \"MySQL\", \"Redis\"]','PUBLIC','2026-10-07 05:55:39.404304','2026-10-07 05:55:39.404304',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `candidates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_applications`
--

DROP TABLE IF EXISTS `job_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_applications` (
  `id` varchar(36) NOT NULL,
  `job_id` varchar(255) NOT NULL,
  `candidate_id` varchar(255) NOT NULL,
  `coverLetter` text,
  `resumeUrlSnapshot` varchar(500) NOT NULL,
  `answersJson` json DEFAULT NULL,
  `stage` enum('APPLIED','UNDER_REVIEW','SHORTLISTED','INTERVIEW','OFFERED','REJECTED') NOT NULL DEFAULT 'APPLIED',
  `rating` int NOT NULL DEFAULT '0',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_99292c6cd0ed428e8f5b4e22958` (`job_id`),
  KEY `FK_6ed185c3d4417cc1f5ec3f28e5d` (`candidate_id`),
  CONSTRAINT `FK_6ed185c3d4417cc1f5ec3f28e5d` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_99292c6cd0ed428e8f5b4e22958` FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_applications`
--

LOCK TABLES `job_applications` WRITE;
/*!40000 ALTER TABLE `job_applications` DISABLE KEYS */;
INSERT INTO `job_applications` VALUES ('44c4c2c9-6dd1-4fa7-a317-8df1ab207ad8','381fb878-a4a8-414b-8783-a6fec014411d','4148109f-c29f-4913-9c97-b39d76783463','I have 6 years of hands-on experience building enterprise web applications using Next.js App Router and NestJS microservices.','https://example.com/resumes/john-doe-resume.pdf',NULL,'SHORTLISTED',5,'2026-10-07 05:55:39.416477','2026-10-07 05:55:39.416477'),('c1d916d0-ae85-4b93-85ea-de39f3f41126','0059dc7a-255b-4feb-9e20-992894e624c4','4148109f-c29f-4913-9c97-b39d76783463','','https://example.com/resumes/john-doe-resume.pdf','{\"currentCtc\": \"120000\", \"expectedCtc\": \"150000\", \"noticePeriod\": \"Immediate / 15 Days\", \"currentLocation\": \"New York, NY\", \"willingToRelocate\": true}','APPLIED',0,'2026-10-09 03:43:16.671036','2026-10-09 03:43:16.671036');
/*!40000 ALTER TABLE `job_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_postings`
--

DROP TABLE IF EXISTS `job_postings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_postings` (
  `id` varchar(36) NOT NULL,
  `tenant_id` varchar(255) NOT NULL,
  `posted_by_user_id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `employmentType` enum('Full-time','Part-time','Contract','Internship','Remote') NOT NULL DEFAULT 'Full-time',
  `experienceLevel` enum('Entry','Mid','Senior','Lead','Executive') NOT NULL DEFAULT 'Mid',
  `salaryMin` decimal(12,2) DEFAULT NULL,
  `salaryMax` decimal(12,2) DEFAULT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `isSalaryVisible` tinyint NOT NULL DEFAULT '1',
  `locationCountry` varchar(100) NOT NULL,
  `locationCity` varchar(100) NOT NULL,
  `isRemote` tinyint NOT NULL DEFAULT '0',
  `isFeatured` tinyint NOT NULL DEFAULT '0',
  `screeningQuestions` json DEFAULT NULL,
  `status` enum('DRAFT','PENDING_APPROVAL','PUBLISHED','EXPIRED','ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  `expiresAt` timestamp NOT NULL,
  `viewsCount` int NOT NULL DEFAULT '0',
  `applicationsCount` int NOT NULL DEFAULT '0',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `applyType` varchar(20) NOT NULL DEFAULT 'INTERNAL',
  `applyUrl` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_71549ebdaf6647e51de711396c3` (`tenant_id`),
  KEY `FK_e24ab7cffe7b1ecfd256441581a` (`posted_by_user_id`),
  CONSTRAINT `FK_71549ebdaf6647e51de711396c3` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_e24ab7cffe7b1ecfd256441581a` FOREIGN KEY (`posted_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_postings`
--

LOCK TABLES `job_postings` WRITE;
/*!40000 ALTER TABLE `job_postings` DISABLE KEYS */;
INSERT INTO `job_postings` VALUES ('0059dc7a-255b-4feb-9e20-992894e624c4','3ec4391c-d7e6-4810-9ac1-64f6e207fd8d','537b19b2-0785-46b6-9899-ed1f166a0469','SDE 3 Wipro','sde-3-wipro','gr','Engineering','Full-time','Senior',120000.00,160000.00,'USD',1,'United States','Pune',1,0,'[]','PUBLISHED','2026-12-08 03:40:15',0,0,'2026-10-09 03:40:15.308615','2026-10-09 03:40:15.308615','INTERNAL',NULL),('318d73f0-bdf2-4ad8-b661-1d0bb93c76b1','b0c543fb-d25b-401e-a84d-1ef897f004ad','537b19b2-0785-46b6-9899-ed1f166a0469','AI / Machine Learning Engineer (LLMs & Agents)','ai-machine-learning-engineer','Build agentic AI workflows, vector search indexes, and custom fine-tuned models for enterprise talent sourcing.','Artificial Intelligence','Full-time','Senior',160000.00,210000.00,'USD',1,'United States','Boston, MA',1,1,NULL,'PUBLISHED','2026-12-06 05:55:39',0,0,'2026-10-07 05:55:39.413943','2026-10-07 05:55:39.413943','INTERNAL',NULL),('381fb878-a4a8-414b-8783-a6fec014411d','5c88e4d2-4e38-4e15-817b-a19fe3090e8c','537b19b2-0785-46b6-9899-ed1f166a0469','Senior Full Stack Engineer (Next.js & NestJS)','senior-full-stack-engineer-nextjs-nestjs','Lead design and development of enterprise multi-tenant web applications using Next.js App Router and NestJS microservices.','Engineering','Full-time','Senior',140000.00,180000.00,'USD',1,'United States','San Francisco, CA',1,1,'[{\"id\": \"q1\", \"options\": [\"1-2 Years\", \"3-5 Years\", \"5+ Years\"], \"isRequired\": true, \"questionText\": \"How many years of commercial experience do you have with Next.js & NestJS?\", \"questionType\": \"CHOICE\"}, {\"id\": \"q2\", \"isRequired\": true, \"questionText\": \"Are you legally authorized to work in the US or work remotely?\", \"questionType\": \"YES_NO\"}]','PUBLISHED','2026-12-06 05:55:39',0,0,'2026-10-07 05:55:39.407215','2026-10-07 05:55:39.407215','INTERNAL',NULL),('39ba1728-227c-4512-bc96-d66a9d146afe','3ec4391c-d7e6-4810-9ac1-64f6e207fd8d','537b19b2-0785-46b6-9899-ed1f166a0469','SDE 2','sde-2','dsfd','Engineering','Full-time','Senior',120000.00,160000.00,'USD',1,'United States','PUNE',1,0,'[]','PUBLISHED','2026-12-07 22:23:52',0,0,'2026-10-08 22:23:52.407412','2026-10-08 22:23:52.407412','INTERNAL',NULL),('55dc8600-f612-4f28-869f-21b7f1dd5260','9e1edcde-e34d-45da-a0cd-a660c1670714','537b19b2-0785-46b6-9899-ed1f166a0469','Senior Product Designer (UI/UX & Design Systems)','senior-product-designer','Craft beautiful responsive UI components, design tokens, and dark/light mode themes for scalable SaaS platforms.','Design & Creative','Contract','Mid',110000.00,140000.00,'USD',1,'United States','Austin, TX',1,0,NULL,'PUBLISHED','2026-12-06 05:55:39',0,0,'2026-10-07 05:55:39.411698','2026-10-07 05:55:39.411698','INTERNAL',NULL),('a4902b5a-3cd9-4b11-848e-6b7f174df2a5','3ec4391c-d7e6-4810-9ac1-64f6e207fd8d','537b19b2-0785-46b6-9899-ed1f166a0469','Principal Cloud Architect (AWS & Microservices)','principal-cloud-architect-aws','Architect high-throughput financial transaction infrastructure with zero downtime and sub-millisecond latencies.','DevOps & Architecture','Full-time','Lead',190000.00,240000.00,'USD',1,'United States','New York, NY',0,1,NULL,'PUBLISHED','2026-12-06 05:55:39',0,0,'2026-10-07 05:55:39.409590','2026-10-07 05:55:39.409590','INTERNAL',NULL);
/*!40000 ALTER TABLE `job_postings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plans` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` enum('FREE','GROWTH','PRO','ENTERPRISE') NOT NULL,
  `priceMonthly` decimal(10,2) NOT NULL DEFAULT '0.00',
  `priceYearly` decimal(10,2) NOT NULL DEFAULT '0.00',
  `maxActiveJobs` int NOT NULL DEFAULT '2',
  `maxResumeDownloads` int NOT NULL DEFAULT '0',
  `maxFeaturedJobs` int NOT NULL DEFAULT '0',
  `maxTeamSeats` int NOT NULL DEFAULT '1',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_2d2df70a81d37c893ef216caf8` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plans`
--

LOCK TABLES `subscription_plans` WRITE;
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
INSERT INTO `subscription_plans` VALUES ('3a3199dc-b3dd-4134-9e73-cc5bba9470ca','Enterprise Scale','ENTERPRISE',499.00,399.00,50,500,0,15,1,'2026-10-07 05:55:39.382848'),('5e9ce62d-9be6-4bea-b51a-434a6cbf48a5','Professional Employer','PRO',199.00,159.00,15,150,0,5,1,'2026-10-07 05:55:39.380929'),('64072253-566c-4ae2-888b-13fd319cd388','Starter Company','FREE',0.00,0.00,2,0,0,1,1,'2026-10-07 05:55:39.370584'),('93cd8066-7c77-4353-a011-3f5d710bb877','Growth Employer','GROWTH',99.00,79.00,5,50,0,3,1,'2026-10-07 05:55:39.378564');
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_subscriptions`
--

DROP TABLE IF EXISTS `tenant_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_subscriptions` (
  `id` varchar(36) NOT NULL,
  `tenant_id` varchar(255) NOT NULL,
  `plan_id` varchar(255) NOT NULL,
  `stripeSubscriptionId` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','PAST_DUE','CANCELED','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  `activeJobsUsed` int NOT NULL DEFAULT '0',
  `resumeDownloadsUsed` int NOT NULL DEFAULT '0',
  `featuredJobsUsed` int NOT NULL DEFAULT '0',
  `currentPeriodStart` timestamp NOT NULL,
  `currentPeriodEnd` timestamp NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_c59c97d5c1343951e044c137f02` (`tenant_id`),
  KEY `FK_cb2ac3bd398220d534c92db8b2e` (`plan_id`),
  CONSTRAINT `FK_c59c97d5c1343951e044c137f02` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_cb2ac3bd398220d534c92db8b2e` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_subscriptions`
--

LOCK TABLES `tenant_subscriptions` WRITE;
/*!40000 ALTER TABLE `tenant_subscriptions` DISABLE KEYS */;
INSERT INTO `tenant_subscriptions` VALUES ('56cea36a-b1ef-4051-8a24-b4a7a48a30d8','3ec4391c-d7e6-4810-9ac1-64f6e207fd8d','5e9ce62d-9be6-4bea-b51a-434a6cbf48a5',NULL,'ACTIVE',1,0,0,'2026-10-07 05:55:39','2026-11-06 05:55:39','2026-10-07 05:55:39.394872','2026-10-08 22:39:08.000000'),('ff87c620-e561-49ed-87fa-5b824ff41549','5c88e4d2-4e38-4e15-817b-a19fe3090e8c','5e9ce62d-9be6-4bea-b51a-434a6cbf48a5',NULL,'ACTIVE',1,0,0,'2026-10-07 05:55:39','2026-11-06 05:55:39','2026-10-07 05:55:39.392987','2026-10-07 05:55:39.392987');
/*!40000 ALTER TABLE `tenant_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('COMPANY','CONSULTANCY') NOT NULL DEFAULT 'COMPANY',
  `slug` varchar(255) NOT NULL,
  `logoUrl` varchar(500) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `taxId` varchar(100) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `description` text,
  `status` enum('PENDING_VERIFICATION','ACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_2310ecc5cb8be427097154b18f` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES ('3ec4391c-d7e6-4810-9ac1-64f6e207fd8d','FinTech Dynamics Corp','COMPANY','fintech-dynamics','https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=120',NULL,NULL,'Financial Services','High-throughput payment gateway and algorithmic trading systems.','ACTIVE','2026-10-07 05:55:39.387339','2026-10-07 05:55:39.387339'),('5c88e4d2-4e38-4e15-817b-a19fe3090e8c','TechCorp Global','COMPANY','techcorp-global','https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',NULL,NULL,'Software & Technology','Leading global enterprise technology and software innovation group.','ACTIVE','2026-10-07 05:55:39.385519','2026-10-07 05:55:39.385519'),('9e1edcde-e34d-45da-a0cd-a660c1670714','DesignCraft Studio','COMPANY','designcraft-studio','https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=120',NULL,NULL,'Design & Creative','Creative design studio crafting enterprise design tokens and web experiences.','ACTIVE','2026-10-07 05:55:39.389189','2026-10-07 05:55:39.389189'),('b0c543fb-d25b-401e-a84d-1ef897f004ad','Neural Mind AI','COMPANY','neural-mind-ai','https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120',NULL,NULL,'Artificial Intelligence','Building next-generation generative AI agent systems.','ACTIVE','2026-10-07 05:55:39.390907','2026-10-07 05:55:39.390907');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `role` enum('SUPER_ADMIN','COMPANY_ADMIN','RECRUITER','CONSULTANCY_ADMIN','AGENCY_AGENT','CANDIDATE') NOT NULL DEFAULT 'CANDIDATE',
  `phoneNumber` varchar(50) DEFAULT NULL,
  `avatarUrl` varchar(500) DEFAULT NULL,
  `isEmailVerified` tinyint NOT NULL DEFAULT '0',
  `status` enum('ACTIVE','INACTIVE','BANNED') NOT NULL DEFAULT 'ACTIVE',
  `tenant_id` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`),
  KEY `FK_109638590074998bb72a2f2cf08` (`tenant_id`),
  CONSTRAINT `FK_109638590074998bb72a2f2cf08` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('537b19b2-0785-46b6-9899-ed1f166a0469','recruiter@techcorp.com','recruiter123','Sarah','Jenkins','COMPANY_ADMIN',NULL,'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',1,'ACTIVE','5c88e4d2-4e38-4e15-817b-a19fe3090e8c','2026-10-07 05:55:39.399753','2026-10-07 05:55:39.399753'),('a55b9ce1-5257-4618-90f6-b79bd16dca0c','admin@camzyjobs.com','admin123','Super','Admin','SUPER_ADMIN',NULL,'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',1,'ACTIVE',NULL,'2026-10-07 05:55:39.397892','2026-10-07 05:55:39.397892'),('fec2474b-2956-4e02-ad92-db25a44cf6af','candidate@example.com','candidate123','John','Doe','CANDIDATE',NULL,'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',1,'ACTIVE',NULL,'2026-10-07 05:55:39.401850','2026-10-07 05:55:39.401850');
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

-- Dump completed on 2026-10-09  7:09:16
