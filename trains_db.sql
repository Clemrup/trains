-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : lun. 08 déc. 2025 à 16:34
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `trains_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `lieux`
--

CREATE TABLE `lieux` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `lieux`
--

INSERT INTO `lieux` (`id`, `nom`) VALUES
(1, 'Mulhouse Ville'),
(2, 'Thann'),
(3, 'Besançon Franche-Comté TGV'),
(4, 'Colmar'),
(5, 'Besançon Viotte'),
(6, 'Dijon Ville'),
(7, 'Bollwiller'),
(8, 'Mulhouse – Dornach'),
(9, 'Thann Centre'),
(10, 'Mulhouse – Nord'),
(11, 'École-Valentin'),
(12, 'Paris Gare de Lyon');

-- --------------------------------------------------------

--
-- Structure de la table `livrees`
--

CREATE TABLE `livrees` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `color` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `livrees`
--

INSERT INTO `livrees` (`id`, `nom`, `color`) VALUES
(1, 'Lorraine', '#ffff0055'),
(2, 'Alsace', '#ff333355'),
(3, 'InOui', '#bbbbbb55'),
(4, 'Franche-Comté', '#00aa6655'),
(5, 'FRET', '#2fba85dd'),
(6, 'Carmillon', '#66666655'),
(7, 'Lyria', '#ff000077'),
(8, 'Transfrontalière', '#0022aa66'),
(9, 'Grand Est', '#007bff55'),
(10, 'Mobigo', '#66ff0055'),
(11, 'Neutre', '#3366ff55'),
(12, 'Bourgogne', '#ffdd0055'),
(13, 'Europorte', '#ccccee55'),
(14, 'Fluo', '#d7ff00aa'),
(15, 'Champagne-Ardenne', '#f7b50088'),
(16, 'Haute-Normandie', '#00a6d655'),
(17, 'Ligne des Hirondelles', '#fffb0088'),
(18, 'InOui Disneyland', '#00aa6699'),
(19, 'Akiem', '#7a7c8099'),
(20, 'Infra', '#ffee00aa'),
(21, 'Neutre Gris', '#11111125');

-- --------------------------------------------------------

--
-- Structure de la table `medias`
--

CREATE TABLE `medias` (
  `id` int(11) NOT NULL,
  `type_media` enum('image','video') NOT NULL DEFAULT 'image',
  `media_url` varchar(255) DEFAULT NULL,
  `id_lieu1` int(11) NOT NULL,
  `id_lieu2` int(11) DEFAULT NULL,
  `date_ajout` date DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `medias`
--

INSERT INTO `medias` (`id`, `type_media`, `media_url`, `id_lieu1`, `id_lieu2`, `date_ajout`) VALUES
(1, 'image', 'images/Régiolis/84665M_01.jpg', 1, NULL, '2024-01-07'),
(2, 'video', 'https://youtube.com/embed/0xybAHlSscc', 2, NULL, '2024-11-03'),
(3, 'video', 'https://youtube.com/embed/jStgV3HG3Vc', 3, NULL, '2024-11-03'),
(4, 'video', 'https://youtube.com/embed/W5WXnitFl9Q', 3, NULL, '2024-10-12'),
(5, 'video', 'https://youtube.com/embed/K0WaNLwH7_8', 3, NULL, '2024-11-23'),
(6, 'image', 'images/TGV_D/4704_4713.jpg', 3, NULL, '2024-11-23'),
(7, 'video', 'https://youtube.com/embed/T6yK263Q4SQ', 3, NULL, '2024-11-23'),
(8, 'video', 'https://youtube.com/embed/MrNJy9PDHbQ', 4, NULL, '2024-12-08'),
(9, 'video', 'https://youtube.com/embed/GHKxxR0cOyM', 4, NULL, '2024-12-08'),
(10, 'video', 'https://youtube.com/embed/WQgCqT_n86I', 5, NULL, '2024-12-13'),
(11, 'image', 'images/TGV_D/232_250.jpg', 5, NULL, '2024-12-13'),
(12, 'video', 'https://youtube.com/embed/xH1XJD9gA80', 6, NULL, '2025-01-08'),
(13, 'video', 'https://youtube.com/embed/_8ZxrCLc3Uk', 3, NULL, '2025-01-10'),
(14, 'video', 'https://youtube.com/embed/wK9cl-qLc8E', 3, NULL, '2025-01-10'),
(15, 'video', 'https://youtube.com/embed/2V7J2Ic9CQk', 3, NULL, '2025-01-10'),
(16, 'video', 'https://youtube.com/embed/KWX2hxUdGd0', 7, NULL, '2025-01-17'),
(17, 'video', 'https://youtube.com/embed/9dy7_As5QJ4', 1, NULL, '2025-01-19'),
(18, 'video', 'https://youtube.com/embed/cIJOJR281SQ', 3, NULL, '2025-01-19'),
(19, 'video', 'https://youtube.com/embed/1KNB7S_oZrs', 1, NULL, '2025-01-30'),
(20, 'video', 'https://youtube.com/embed/HdiDewBdyMo', 3, NULL, '2025-01-30'),
(21, 'video', 'https://youtube.com/embed/OEzdBoefJfA', 3, NULL, '2025-02-18'),
(22, 'video', 'https://youtube.com/embed/hgzmI3cjwRw', 3, NULL, '2025-02-19'),
(23, 'video', 'https://youtube.com/embed/hgWrYGjyxjo', 3, NULL, '2025-02-19'),
(24, 'video', 'https://youtube.com/embed/MjUy7RMxIqo', 3, NULL, '2025-02-19'),
(25, 'image', 'images/TGV_D/4708_1.jpg', 3, NULL, '2025-02-19'),
(26, 'image', 'images/TGV_D/4708_2.jpg', 3, NULL, '2025-02-19'),
(27, 'video', 'https://youtube.com/embed/7fvZHPy0mUw', 3, NULL, '2025-02-19'),
(28, 'video', 'https://youtube.com/embed/sMJgjmutpUk', 3, NULL, '2025-02-19'),
(29, 'video', 'https://youtube.com/embed/TtihQdujfHg', 7, NULL, '2025-03-01'),
(30, 'image', 'images/Régiolis/85509M_01.jpg', 8, NULL, '2025-03-01'),
(31, 'video', 'https://youtube.com/embed/vAP_-HDvazs', 1, NULL, '2025-03-01'),
(32, 'video', 'https://youtube.com/embed/7Mg1qKn1tqE', 3, 11, '2025-03-05'),
(33, 'video', 'https://youtube.com/embed/kx0edjeFxLk', 3, NULL, '2025-03-05'),
(34, 'video', 'https://youtube.com/embed/Y9cU8t4dZbw', 5, NULL, '2025-03-14'),
(35, 'video', 'https://youtube.com/embed/Dkia7YTHhq4', 5, NULL, '2025-03-23'),
(36, 'image', 'images/TGV_D/245_715.jpg', 1, NULL, '2025-03-30'),
(37, 'image', 'images/AGC/27600_1.jpg', 3, NULL, '2025-03-30'),
(38, 'image', 'images/AGC/27599_1.jpg', 3, NULL, '2025-03-30'),
(39, 'image', 'images/TGV_R/538.jpg', 3, NULL, '2025-04-04'),
(40, 'video', 'https://youtube.com/embed/NsWv_pnvNdE', 3, NULL, '2025-04-04'),
(41, 'video', 'https://youtube.com/embed/2RcIqu7xJ6U', 3, NULL, '2025-04-04'),
(42, 'image', 'images/TGV_D/4714.jpg', 3, NULL, '2025-04-04'),
(43, 'video', 'https://youtube.com/embed/z7Jw3VxoRjY', 3, NULL, '2025-04-04'),
(44, 'video', 'https://youtube.com/embed/X3A3sta7Yh8', 3, NULL, '2025-04-04'),
(45, 'video', 'https://youtube.com/embed/rE1fleJZLlM', 3, NULL, '2025-04-04'),
(46, 'image', 'images/TGV_D/291_1.jpg', 3, NULL, '2025-04-04'),
(47, 'image', 'images/TGV_RD/606.jpg', 1, NULL, '2025-04-04'),
(48, 'image', 'images/AGC/27868.jpg', 1, NULL, '2025-11-18'),
(49, 'image', 'images/AGC/27867.jpg', 1, NULL, '2025-04-04'),
(50, 'image', 'images/TGV_RD/619.jpg', 1, NULL, '2025-04-06'),
(51, 'image', 'images/Régiolis/51627M.jpg', 3, NULL, '2025-04-06'),
(52, 'image', 'images/TGV_D/245_1.jpg', 3, NULL, '2025-04-11'),
(53, 'image', 'images/TGV_R/245_537_543.jpg', 3, NULL, '2025-04-11'),
(54, 'image', 'images/TGV_D/245_2.jpg', 3, NULL, '2025-04-11'),
(55, 'image', 'images/TGV_D/712.jpg', 3, NULL, '2025-04-11'),
(56, 'image', 'images/Régiolis/83507L.jpg', 1, NULL, '2025-04-11'),
(57, 'video', 'https://youtube.com/embed/vQUJR1PxokE', 7, NULL, '2025-04-15'),
(58, 'video', 'https://youtube.com/embed/kxlMWr2egaA', 7, NULL, '2025-04-15'),
(59, 'video', 'https://youtube.com/embed/GwWAXBiPvSw', 7, NULL, '2025-04-15'),
(60, 'image', 'images/Régiolis/85549M.jpg', 7, NULL, '2025-04-15'),
(61, 'image', 'images/Corail/140.jpg', 1, NULL, '2025-04-15'),
(62, 'image', 'images/TGV_D/4716.jpg', 1, NULL, '2025-04-15'),
(63, 'image', 'images/Corail/001.jpg', 1, NULL, '2025-04-15'),
(64, 'video', 'https://youtube.com/embed/zlUyGUi11X8', 1, NULL, '2025-04-15'),
(65, 'image', 'images/TGV_D/824.jpg', 1, NULL, '2025-04-15'),
(66, 'image', 'images/TGV_D/4727.jpg', 1, NULL, '2025-04-15'),
(67, 'image', 'images/AGC/76798.jpg', 1, NULL, '2025-04-15'),
(68, 'image', 'images/AGC/76797.jpg', 1, NULL, '2025-04-15'),
(69, 'image', 'images/AGC/27878_1.jpg', 1, NULL, '2025-04-15'),
(70, 'image', 'images/AGC/27877.jpg', 1, NULL, '2025-04-15'),
(71, 'image', 'images/ATER/73910.jpg', 1, NULL, '2025-04-15'),
(72, 'image', 'images/Régiolis/83003L.jpg', 1, NULL, '2025-04-15'),
(73, 'image', 'images/TGV_D/856.jpg', 1, NULL, '2025-04-15'),
(74, 'image', 'images/Régiolis/85531M_1.jpg', 1, NULL, '2025-04-15'),
(75, 'image', 'images/ATER/73549.jpg', 5, NULL, '2025-04-15'),
(76, 'image', 'images/Régiolis/51573M.jpg', 5, NULL, '2025-04-15'),
(77, 'image', 'images/AGC/27570.jpg', 5, NULL, '2025-04-15'),
(78, 'image', 'images/AGC/27569.jpg', 5, NULL, '2025-04-15'),
(79, 'image', 'images/Régiolis/51615M.jpg', 5, NULL, '2025-04-15'),
(80, 'image', 'images/Régiolis/51617M_1.jpg', 5, NULL, '2025-04-15'),
(81, 'image', 'images/TGV_D/297.jpg', 5, NULL, '2025-04-18'),
(82, 'video', 'https://youtube.com/embed/KIUELSdHVM4', 3, NULL, '2025-04-18'),
(83, 'image', 'images/AGC/27870_1.jpg', 1, NULL, '2025-04-18'),
(84, 'image', 'images/ATER/73905.jpg', 1, NULL, '2025-04-18'),
(85, 'image', 'images/Régiolis/83569L.jpg', 1, NULL, '2025-04-18'),
(86, 'video', 'https://youtube.com/embed/HILzNVBbho4', 7, NULL, '2025-04-30'),
(87, 'image', 'images/Régiolis/85553M.jpg', 9, NULL, '2025-04-30'),
(88, 'image', 'images/Régiolis/83575L.jpg', 1, NULL, '2025-05-04'),
(89, 'image', 'images/Régiolis/85507M.jpg', 1, NULL, '2025-05-04'),
(90, 'image', 'images/TGV_D/239_253.jpg', 1, NULL, '2025-05-04'),
(91, 'image', 'images/TGV_D/241_716.jpg', 1, NULL, '2025-05-04'),
(92, 'image', 'images/Régiolis/85007L.jpg', 1, NULL, '2025-05-04'),
(93, 'image', 'images/AGC/27738.jpg', 3, NULL, '2025-05-04'),
(94, 'video', 'https://youtube.com/embed/2ROkKSSUA3w', 5, NULL, '2025-05-04'),
(95, 'image', 'images/Régiolis/51579M.jpg', 5, NULL, '2025-05-04'),
(96, 'image', 'images/Régiolis/51625M_1.jpg', 5, NULL, '2025-05-04'),
(97, 'image', 'images/Régiolis/51577M_51623M.jpg', 5, NULL, '2025-05-04'),
(98, 'image', 'images/TGV_D/868.jpg', 5, NULL, '2025-05-07'),
(99, 'image', 'images/Régiolis/51581M_51629M_51615M_51617M.jpg', 5, NULL, '2025-05-07'),
(100, 'image', 'images/Régiolis/51593M.jpg', 5, NULL, '2025-05-07'),
(101, 'image', 'images/AGC/27526.jpg', 5, NULL, '2025-05-07'),
(102, 'image', 'images/BB/37502.jpg', 5, NULL, '2025-05-07'),
(103, 'image', 'images/ATER/73567.jpg', 5, NULL, '2025-05-07'),
(104, 'image', 'images/Régiolis/51587M.jpg', 5, NULL, '2025-05-07'),
(105, 'image', 'images/ATER/73753_73567_51587M.jpg', 5, NULL, '2025-05-07'),
(106, 'image', 'images/AGC/27878_2.jpg', 1, NULL, '2025-05-07'),
(107, 'image', 'images/TGV_D/715.jpg', 1, NULL, '2025-05-07'),
(108, 'image', 'images/Régiolis/85537M.jpg', 1, NULL, '2025-05-07'),
(109, 'image', 'images/BB/26140R_83571L.jpg', 1, NULL, '2025-05-07'),
(110, 'image', 'images/Corail/127.jpg', 1, NULL, '2025-05-07'),
(111, 'image', 'images/AGC/76602.jpg', 1, NULL, '2025-05-12'),
(112, 'video', 'https://youtube.com/embed/5xh445dF0_4', 1, NULL, '2025-05-12'),
(113, 'image', 'images/TGV_D/823.jpg', 1, NULL, '2025-05-12'),
(114, 'image', 'images/ATER/73907.jpg', 1, NULL, '2025-05-12'),
(115, 'image', 'images/TGV_D/279.jpg', 1, NULL, '2025-05-12'),
(116, 'image', 'images/BB/26141R.jpg', 1, NULL, '2025-05-12'),
(117, 'video', 'https://youtube.com/embed/D1YisAqchtI', 1, NULL, '2025-05-12'),
(118, 'image', 'images/BB/75128.jpg', 1, NULL, '2025-05-12'),
(119, 'video', 'https://youtube.com/embed/8X9pEczlVcU', 1, NULL, '2025-05-12'),
(120, 'image', 'images/TGV_D/276_253.jpg', 3, NULL, '2025-05-12'),
(121, 'image', 'images/ATER/73748.jpg', 3, NULL, '2025-05-12'),
(122, 'image', 'images/ATER/73722.jpg', 5, NULL, '2025-05-12'),
(123, 'image', 'images/Régiolis/51595M.jpg', 5, NULL, '2025-05-12'),
(124, 'video', 'https://youtube.com/embed/EwFfUa1Pb8I', 1, NULL, '2025-05-12'),
(125, 'image', 'images/Régiolis/51575M.jpg', 5, NULL, '2025-05-16'),
(126, 'image', 'images/Régiolis/51585M_1.jpg', 5, NULL, '2025-05-16'),
(127, 'image', 'images/Régiolis/51623M.jpg', 5, NULL, '2025-05-16'),
(128, 'image', 'images/AGC/27505.jpg', 5, NULL, '2025-05-16'),
(129, 'image', 'images/AGC/27737.jpg', 5, NULL, '2025-05-16'),
(130, 'image', 'images/AGC/27506.jpg', 5, NULL, '2025-05-16'),
(131, 'image', 'images/Régiolis/51565M_1.jpg', 5, NULL, '2025-05-16'),
(132, 'image', 'images/AGC/76667.jpg', 5, NULL, '2025-05-16'),
(133, 'image', 'images/AGC/27572_1.jpg', 5, NULL, '2025-05-16'),
(134, 'image', 'images/AGC/27571.jpg', 5, NULL, '2025-05-16'),
(135, 'image', 'images/ATER/73608.jpg', 5, NULL, '2025-05-16'),
(136, 'video', 'https://youtube.com/embed/rSYSYwMWs-M', 5, NULL, '2025-05-16'),
(137, 'image', 'images/AGC/27869.jpg', 1, NULL, '2025-05-16'),
(138, 'image', 'images/ATER/73917.jpg', 1, NULL, '2025-05-16'),
(139, 'image', 'images/TGV_D/718.jpg', 1, NULL, '2025-05-16'),
(140, 'image', 'images/Corail/131.jpg', 1, NULL, '2025-05-16'),
(141, 'video', 'https://youtube.com/embed/hsiT7L0GUng', 1, NULL, '2025-05-16'),
(142, 'video', 'https://youtube.com/embed/Wjwf7a454aE', 1, NULL, '2025-05-16'),
(143, 'video', 'https://youtube.com/embed/fc-xuUP3x5w', 1, NULL, '2025-05-16'),
(144, 'image', 'images/ATER/73548.jpg', 1, NULL, '2025-05-16'),
(145, 'image', 'images/Régiolis/85531M_2.jpg', 1, NULL, '2025-05-16'),
(146, 'video', 'https://youtube.com/embed/HcM47ndFXKE', 1, NULL, '2025-05-16'),
(147, 'image', 'images/Corail/125_1.jpg', 1, NULL, '2025-05-16'),
(148, 'video', 'https://youtube.com/embed/VrV5DpLHeYg', 1, NULL, '2025-05-16'),
(149, 'video', 'https://youtube.com/embed/gYMVparp_Eo', 1, NULL, '2025-05-16'),
(150, 'image', 'images/Régiolis/85511M_1.jpg', 1, NULL, '2025-05-16'),
(151, 'video', 'https://youtube.com/embed/sRZlrmpQA2U', 1, NULL, '2025-05-16'),
(152, 'video', 'https://youtube.com/embed/_-Z4MGNcZGg', 7, NULL, '2025-05-19'),
(153, 'video', 'https://youtube.com/embed/qdk4DY8glZ0', 7, NULL, '2025-05-19'),
(154, 'image', 'images/TGV_R/544_76711.jpg', 4, NULL, '2025-05-19'),
(155, 'image', 'images/TGV_R/544_76712.jpg', 4, NULL, '2025-05-19'),
(156, 'video', 'https://youtube.com/embed/ZP2dEguK17g', 4, NULL, '2025-05-19'),
(157, 'video', 'https://youtube.com/embed/_Odlnyfwmg8', 4, NULL, '2025-05-19'),
(158, 'video', 'https://youtube.com/embed/E-KzNTv7T-0', 10, NULL, '2025-05-19'),
(159, 'video', 'https://youtube.com/embed/M5cGdG5RvFQ', 10, NULL, '2025-05-19'),
(160, 'image', 'images/ATER/73751.jpg', 3, NULL, '2025-05-19'),
(161, 'image', 'images/ATER/73753.jpg', 3, NULL, '2025-05-19'),
(162, 'image', 'images/ATER/73750.jpg', 3, NULL, '2025-05-19'),
(163, 'image', 'images/AGC/76564.jpg', 5, NULL, '2025-05-19'),
(164, 'image', 'images/Régiolis/51571M_1.jpg', 5, NULL, '2025-05-19'),
(165, 'image', 'images/Régiolis/51570M.jpg', 5, NULL, '2025-05-19'),
(166, 'image', 'images/Régiolis/51625M_2.jpg', 5, NULL, '2025-05-19'),
(167, 'image', 'images/Régiolis/51589M_1.jpg', 5, NULL, '2025-05-19'),
(168, 'image', 'images/Régiolis/51585M_2.jpg', 5, NULL, '2025-05-23'),
(169, 'image', 'images/Régiolis/51589M_2.jpg', 5, NULL, '2025-05-23'),
(170, 'image', 'images/Régiolis/51581M.jpg', 5, NULL, '2025-05-23'),
(171, 'image', 'images/ATER/73757.jpg', 5, NULL, '2025-05-23'),
(172, 'image', 'images/Régiolis/51617M_2.jpg', 5, NULL, '2025-05-23'),
(173, 'image', 'images/Régiolis/51565M_2.jpg', 5, NULL, '2025-05-23'),
(174, 'image', 'images/Régiolis/51571M_1.jpg', 5, NULL, '2025-05-23'),
(175, 'image', 'images/AGC/27572_2.jpg', 5, NULL, '2025-05-23'),
(176, 'image', 'images/TGV_D/206.jpg', 5, NULL, '2025-05-23'),
(177, 'video', 'https://youtube.com/embed/-zCN4LarDj0', 6, NULL, '2025-05-23'),
(178, 'image', 'images/TGV_D/206_861_717_296.jpg', 12, NULL, '2025-05-23'),
(179, 'image', 'images/TGV_D/717_296_852.jpg', 12, NULL, '2025-05-23'),
(180, 'image', 'images/TGV_D/259_868_715.jpg', 12, NULL, '2025-05-24'),
(181, 'image', 'images/TGV_D/4719_259_868.jpg', 12, NULL, '2025-05-24'),
(182, 'image', 'images/TGV_D/868_715.jpg', 12, NULL, '2025-05-24'),
(183, 'image', 'images/TGV_D/727.jpg', 12, NULL, '2025-05-24'),
(184, 'image', 'images/TGV_D/4730.jpg', 12, NULL, '2025-05-24'),
(185, 'image', 'images/TGV_D/226.jpg', 12, NULL, '2025-05-24'),
(186, 'video', 'https://youtube.com/embed/koJn4M8Qiis', 6, NULL, '2025-05-24'),
(187, 'video', 'https://youtube.com/embed/_lzmeixbNIc', 6, NULL, '2025-05-24'),
(188, 'video', 'https://youtube.com/embed/PgMSosgwg8I', 1, NULL, '2025-05-24'),
(189, 'video', 'https://youtube.com/embed/cXnURXrQO1g', 1, NULL, '2025-05-24'),
(190, 'video', 'https://youtube.com/embed/OfLJrgH7R-w', 1, NULL, '2025-05-24'),
(191, 'video', 'https://youtube.com/embed/tOgBSzetLvM', 1, NULL, '2025-05-24'),
(192, 'image', 'images/TGV_D/855_727.jpg', 12, NULL, '2025-05-24'),
(193, 'image', 'images/TGV_D/226_711_4730.jpg', 12, NULL, '2025-05-24'),
(194, 'image', 'images/Régiolis/85545M.jpg', 1, NULL, '2025-05-24'),
(195, 'video', 'https://youtube.com/embed/9Ijnlh6vOTI', 1, NULL, '2025-05-24'),
(196, 'image', 'images/Corail/130.jpg', 1, NULL, '2025-05-24'),
(197, 'image', 'images/Corail/125_2.jpg', 1, NULL, '2025-05-24'),
(198, 'image', 'images/Régiolis/85503M.jpg', 1, NULL, '2025-05-24'),
(199, 'image', 'images/Régiolis/85539M_85545M.jpg', 1, NULL, '2025-05-24'),
(200, 'image', 'images/Régiolis/85543M_1.jpg', 7, NULL, '2025-05-28'),
(201, 'image', 'images/Régiolis/85551M.jpg', 1, NULL, '2025-05-28'),
(202, 'image', 'images/AGC/27868_85557M.jpg', 1, NULL, '2025-05-28'),
(203, 'image', 'images/Régiolis/85557M_1.jpg', 1, NULL, '2025-05-28'),
(204, 'video', 'https://youtube.com/embed/pxtaoN946zQ', 1, NULL, '2025-05-28'),
(205, 'image', 'images/Corail/122.jpg', 1, NULL, '2025-05-28'),
(206, 'image', 'images/Régiolis/85559M.jpg', 1, NULL, '2025-05-28'),
(207, 'video', 'https://youtube.com/embed/jkGwhMLLk_Q', 1, NULL, '2025-05-28'),
(208, 'image', 'images/ATER/73661_291.jpg', 1, NULL, '2025-05-28'),
(209, 'image', 'images/TGV_D/291_2.jpg', 1, NULL, '2025-05-28'),
(210, 'image', 'images/Régiolis/85543M_2.jpg', 1, NULL, '2025-05-28'),
(211, 'video', 'https://youtube.com/embed/k7ObWdsnPyE', 1, NULL, '2025-05-28'),
(212, 'video', 'https://youtube.com/embed/ZgaiN6DsVB4', 1, NULL, '2025-05-28'),
(213, 'image', 'images/Régiolis/85557M_2.jpg', 1, NULL, '2025-05-28'),
(214, 'image', 'images/Corail/142_85557M.jpg', 1, NULL, '2025-05-28'),
(215, 'image', 'images/Corail/102.jpg', 1, NULL, '2025-05-28'),
(216, 'image', 'images/BB/26142R.jpg', 1, NULL, '2025-05-28'),
(217, 'image', 'images/TGV_D/860.jpg', 1, NULL, '2025-05-28'),
(218, 'image', 'images/Régiolis/85511M_2.jpg', 7, NULL, '2025-06-03'),
(219, 'image', 'images/AGC/27870_85539M.jpg', 1, NULL, '2025-06-03'),
(220, 'image', 'images/Régiolis/85555M.jpg', 1, NULL, '2025-06-03'),
(221, 'image', 'images/AGC/27870_2.jpg', 1, NULL, '2025-06-03'),
(222, 'image', 'images/Corail/125_3.jpg', 1, NULL, '2025-06-03'),
(223, 'image', 'images/Corail/143.jpg', 1, NULL, '2025-06-03'),
(224, 'video', 'https://youtube.com/embed/Z1eKFADm-5I', 5, NULL, '2025-05-07'),
(225, 'video', 'https://youtube.com/embed/0YR2ggW4Glg', 7, NULL, '2025-06-03'),
(226, 'video', 'https://youtube.com/embed/NWhs1ldZuQU', 7, NULL, '2025-06-03'),
(227, 'video', 'https://youtube.com/embed/oz5gJURPIY0', 1, NULL, '2025-06-03'),
(228, 'video', 'https://youtube.com/embed/Cm4soaOf_lI', 1, NULL, '2025-06-03');

-- --------------------------------------------------------

--
-- Structure de la table `trains`
--

CREATE TABLE `trains` (
  `id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `numero_principal` varchar(20) DEFAULT NULL,
  `numero_secondaire` varchar(20) DEFAULT NULL,
  `date_ajout` datetime DEFAULT current_timestamp(),
  `livree_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `trains`
--

INSERT INTO `trains` (`id`, `type_id`, `nom`, `numero_principal`, `numero_secondaire`, `date_ajout`, `livree_id`) VALUES
(1, 1, 'Régiolis 84665/66M', '84665', '66M', '2025-11-07 14:45:52', 1),
(2, 3, 'ATER 73904', '73904', NULL, '2025-11-07 14:55:04', 2),
(3, 4, 'TGV-D 249', '249', NULL, '2025-11-12 15:59:00', 3),
(4, 2, 'AGC 27589/90', '27589', '90', '2025-11-12 16:02:34', 4),
(5, 5, 'TGV-R 547', '547', NULL, '2025-11-13 10:04:37', 3),
(6, 4, 'TGV-D 4713', '4713', NULL, '2025-11-13 10:10:58', 3),
(7, 4, 'TGV-D 4704', '4704', NULL, '2025-11-13 10:11:58', 3),
(8, 10, 'BB 37058', '37058', NULL, '2025-11-13 14:52:01', 5),
(9, 1, 'Régiolis 84595/96M', '84595', '96M', '2025-11-13 15:03:48', 1),
(10, 4, 'TGV-D 232', '232', NULL, '2025-11-13 15:15:36', 3),
(11, 4, 'TGV-D 250', '250', NULL, '2025-11-13 15:16:00', 3),
(12, 4, 'TGV-D 241', '241', NULL, '2025-11-13 15:30:30', 6),
(13, 4, 'TGV-D 4722', '4722', NULL, '2025-11-13 15:38:50', 7),
(14, 6, 'TGV-RD 615', '615', NULL, '2025-11-13 15:43:13', 3),
(15, 1, 'Régiolis 85543/44M', '85543', '44M', '2025-11-13 15:47:11', 8),
(16, 6, 'TGV-RD 608', '608', NULL, '2025-11-13 16:25:55', 3),
(17, 5, 'TGV-R 501', '501', NULL, '2025-11-13 16:40:40', 3),
(18, 5, 'TGV-R 560', '560', NULL, '2025-11-13 16:40:58', 3),
(19, 9, 'BB 26168R', '26168R', NULL, '2025-11-13 16:43:03', 9),
(20, 8, 'Corail 106', '106', NULL, '2025-11-13 16:54:13', 2),
(21, 4, 'TGV-D 868', '868', NULL, '2025-11-14 15:51:32', 3),
(22, 5, 'TGV-R 548', '548', NULL, '2025-11-14 16:01:57', 3),
(23, 5, 'TGV-R 564', '564', NULL, '2025-11-14 16:02:30', 3),
(24, 4, 'TGV-D 4720', '4720', NULL, '2025-11-14 16:06:17', 7),
(25, 4, 'TGV-D 4728', '4728', NULL, '2025-11-14 16:12:01', 7),
(26, 4, 'TGV-D 4708', '4708', NULL, '2025-11-14 16:23:58', 3),
(27, 5, 'TGV-R 533', '533', NULL, '2025-11-14 16:28:40', 6),
(28, 9, 'BB 26146', '26146', NULL, '2025-11-14 16:39:13', 9),
(29, 8, 'Corail 128', '128', NULL, '2025-11-14 16:39:48', 2),
(30, 1, 'Régiolis 85509/10M', '85509', '10M', '2025-11-17 13:01:37', 8),
(31, 3, 'ATER 73745', '73745', NULL, '2025-11-17 13:27:03', 4),
(32, 1, 'Régiolis 51593/94M', '51593', '94M', '2025-11-17 14:49:52', 10),
(33, 1, 'Régiolis 51567/68M', '51567', '68M', '2025-11-17 15:20:05', 10),
(34, 1, 'Régiolis 51565/66M', '51565', '66M', '2025-11-17 15:27:44', 10),
(35, 4, 'TGV-D 715', '715', NULL, '2025-11-17 15:32:46', 3),
(36, 4, 'TGV-D 245', '245', NULL, '2025-11-17 15:40:55', 3),
(37, 2, 'AGC 27599/600', '27599', '600', '2025-11-17 15:46:48', 4),
(38, 5, 'TGV-R 538', '538', NULL, '2025-11-18 09:30:09', 3),
(39, 5, 'TGV-R 570', '570', NULL, '2025-11-18 09:33:57', 3),
(40, 4, 'TGV-D 4714', '4714', NULL, '2025-11-18 09:38:33', 3),
(41, 5, 'TGV-R 506', '506', NULL, '2025-11-18 09:40:02', 3),
(42, 5, 'TGV-R 545', '545', NULL, '2025-11-18 09:42:12', 3),
(43, 4, 'TGV-D 291', '291', NULL, '2025-11-18 09:48:23', 3),
(44, 6, 'TGV-RD 606', '606', NULL, '2025-11-18 09:50:14', 3),
(45, 2, 'AGC 27867/68', '27867', '68', '2025-11-18 09:52:06', 2),
(46, 6, 'TGV-RD 619', '619', NULL, '2025-11-18 09:55:39', 3),
(47, 1, 'Régiolis 51627/28M', '51627', '28M', '2025-11-18 09:58:49', 10),
(48, 5, 'TGV-R 543', '543', NULL, '2025-11-18 10:03:04', 3),
(49, 5, 'TGV-R 537', '537', NULL, '2025-11-18 10:03:21', 3),
(50, 4, 'TGV-D 712', '712', NULL, '2025-11-18 10:11:32', 3),
(51, 1, 'Régiolis 83507/08L', '83507', '08L', '2025-11-18 10:14:30', 2),
(52, 9, 'BB 26159R', '26159R', NULL, '2025-11-18 12:53:16', 9),
(53, 5, 'TGV-R 544', '544', NULL, '2025-11-18 12:57:44', 3),
(54, 1, 'Régiolis 84591/92M', '84591', '92M', '2025-11-18 13:02:13', 1),
(55, 1, 'Régiolis 85549/50M', '85549', '50M', '2025-11-18 13:04:46', 8),
(56, 8, 'Corail 140', '140', NULL, '2025-11-18 13:06:30', 9),
(57, 4, 'TGV-D 4716', '4716', NULL, '2025-11-18 13:08:50', 7),
(58, 8, 'Corail 001', '001', NULL, '2025-11-18 13:15:48', 9),
(59, 5, 'TGV-R 508', '508', NULL, '2025-11-18 13:17:18', 3),
(60, 5, 'TGV-R 512', '512', NULL, '2025-11-18 13:17:36', 3),
(61, 4, 'TGV-D 824', '824', NULL, '2025-11-18 13:21:27', 3),
(62, 4, 'TGV-D 4727', '4727', NULL, '2025-11-18 13:23:03', 7),
(63, 2, 'AGC 76797/98', '76797', '98', '2025-11-18 13:27:50', 11),
(64, 2, 'AGC 27877/78', '27877', '78', '2025-11-18 13:38:29', 2),
(65, 3, 'ATER 73910', '73910', NULL, '2025-11-18 13:41:16', 2),
(66, 1, 'Régiolis 85003/04L', '85003', '04L', '2025-11-18 13:49:58', 6),
(67, 4, 'TGV-D 856', '856', NULL, '2025-11-18 13:51:28', 3),
(68, 1, 'Régiolis 85531/32M', '85531', '32M', '2025-11-18 13:58:32', 8),
(69, 3, 'ATER 73549', '73549', NULL, '2025-11-18 14:00:39', 4),
(70, 1, 'Régiolis 51573/74M', '51573', '74M', '2025-11-18 14:03:27', 10),
(71, 2, 'AGC 27569/70', '27569', '70', '2025-11-18 14:10:12', 12),
(72, 1, 'Régiolis 51615/16M', '51615', '16M', '2025-11-18 14:12:35', 10),
(73, 1, 'Régiolis 51617/18M', '51617', '18M', '2025-11-18 14:17:00', 10),
(74, 4, 'TGV-D 297', '297', NULL, '2025-11-18 14:21:16', 3),
(75, 4, 'TGV-D 287', '287', NULL, '2025-11-18 14:25:06', 3),
(76, 4, 'TGV-D 275', '275', NULL, '2025-11-18 14:25:26', 3),
(77, 2, 'AGC 27869/70', '27869', '70', '2025-11-18 14:48:46', 2),
(78, 3, 'ATER 73905', '73905', NULL, '2025-11-18 14:50:03', 2),
(79, 1, 'Régiolis 83569/70L', '83569', '70L', '2025-11-18 14:56:54', 2),
(80, 9, 'BB 26140R', '26140R', NULL, '2025-11-18 15:30:11', 9),
(81, 8, 'Corail 127', '127', NULL, '2025-11-18 15:31:32', 9),
(82, 1, 'Régiolis 85553/54M', '85553', '54M', '2025-11-18 15:34:32', 8),
(83, 1, 'Régiolis 83575/76L', '83575', '76L', '2025-11-18 15:40:12', 2),
(84, 1, 'Régiolis 85507/08M', '85507', '08M', '2025-11-18 15:41:02', 8),
(85, 4, 'TGV-D 253', '253', NULL, '2025-11-18 15:45:55', 3),
(86, 4, 'TGV-D 239', '239', NULL, '2025-11-18 15:46:13', 3),
(87, 4, 'TGV-D 716', '716', NULL, '2025-11-18 15:48:37', 3),
(88, 1, 'Régiolis 85007/08L', '85007', '08L', '2025-11-18 15:53:26', 6),
(89, 2, 'AGC 27737/38', '27737', '38', '2025-11-18 15:58:42', 12),
(90, 1, 'Régiolis 51577/78M', '51577', '78M', '2025-11-18 16:02:03', 10),
(91, 1, 'Régiolis 51625/26M', '51625', '26M', '2025-11-18 16:02:33', 10),
(92, 1, 'Régiolis 51579/80M', '51579', '80M', '2025-11-18 16:06:15', 10),
(93, 1, 'Régiolis 51623/24M', '51623', '24M', '2025-11-18 16:10:13', 10),
(94, 1, 'Régiolis 51581/82M', '51581', '82M', '2025-11-18 16:15:19', 10),
(95, 1, 'Régiolis 51629/30M', '51629', '30M', '2025-11-18 16:21:10', 10),
(96, 2, 'AGC 27525/26', '27525', '26', '2025-11-18 16:27:10', 12),
(97, 11, 'BB 37502', '37502', NULL, '2025-11-18 16:31:28', 13),
(98, 3, 'ATER 73567', '73567', NULL, '2025-11-18 16:43:27', 4),
(99, 3, 'ATER 73753', '73753', NULL, '2025-11-18 16:44:13', 4),
(100, 1, 'Régiolis 51587/88M', '51587', '88M', '2025-11-18 16:53:35', 10),
(101, 1, 'Régiolis 85537/38M', '85537', '38M', '2025-11-18 17:02:54', 8),
(102, 1, 'Régiolis 83571/72L', '83571', '72L', '2025-11-18 17:07:37', 2),
(103, 2, 'AGC 76601/02', '76601', '02', '2025-11-19 09:41:22', 14),
(104, 1, 'Régiolis 85001/02L', '85001', '02L', '2025-11-19 09:50:29', 6),
(105, 4, 'TGV-D 823', '823', NULL, '2025-11-19 09:52:03', 3),
(106, 3, 'ATER 73907', '73907', NULL, '2025-11-19 09:53:42', 2),
(107, 4, 'TGV-D 279', '279', NULL, '2025-11-19 09:55:46', 3),
(108, 9, 'BB 26141R', '26141R', NULL, '2025-11-19 09:57:21', 9),
(109, 8, 'Corail 141', '141', NULL, '2025-11-19 09:59:58', 9),
(110, 12, 'BB 75128', '75128', '475128', '2025-11-19 10:09:37', 5),
(111, 9, 'BB 26150', '26150', NULL, '2025-11-19 10:14:27', 9),
(112, 4, 'TGV-D 276', '276', NULL, '2025-11-19 10:16:12', 3),
(113, 3, 'ATER 73748', '73748', NULL, '2025-11-19 10:32:56', 10),
(114, 3, 'ATER 73722', '73722', NULL, '2025-11-19 10:38:24', 10),
(115, 1, 'Régiolis 51595/96M', '51595', '96M', '2025-11-19 10:40:27', 10),
(116, 3, 'ATER 73661', '73661', NULL, '2025-11-19 11:01:03', 15),
(117, 3, 'ATER 73521', '73521', NULL, '2025-11-19 11:01:24', 11),
(118, 1, 'Régiolis 51575/76M', '51575', '76M', '2025-11-19 11:12:11', 10),
(119, 1, 'Régiolis 51585/86M', '51585', '86M', '2025-11-19 11:12:42', 10),
(120, 2, 'AGC 27505/06', '27505', '06', '2025-11-19 11:17:39', 10),
(121, 2, 'AGC 76667/68', '76667', '68', '2025-11-19 14:11:08', 4),
(122, 2, 'AGC 27571/72', '27571', '72', '2025-11-19 14:13:03', 12),
(123, 3, 'ATER 73608', '73608', NULL, '2025-11-19 14:18:05', 4),
(124, 3, 'ATER 73917', '73917', NULL, '2025-11-19 14:24:39', 2),
(125, 4, 'TGV-D 718', '718', NULL, '2025-11-19 14:27:34', 3),
(126, 8, 'Corail 131', '131', NULL, '2025-11-19 14:28:59', 2),
(127, 5, 'TGV-R 513', '513', NULL, '2025-11-19 14:39:32', 3),
(128, 3, 'ATER 73548', '73548', NULL, '2025-11-19 14:45:43', 16),
(129, 8, 'Corail 125', '125', NULL, '2025-11-19 15:05:07', 9),
(130, 8, 'Corail 004', '004', NULL, '2025-11-20 10:43:57', 9),
(131, 9, 'BB 26160R', '26160R', NULL, '2025-11-20 10:46:09', 9),
(132, 1, 'Régiolis 85511/12M', '85511', '12M', '2025-11-20 10:48:21', 8),
(133, 1, 'Régiolis 85503/04M', '85503', '04M', '2025-11-20 10:53:23', 8),
(134, 9, 'BB 26163R', '26163R', NULL, '2025-11-20 10:56:12', 9),
(135, 2, 'AGC 76711/12', '76711', '12', '2025-11-20 11:03:46', 2),
(136, 5, 'TGV-R 503', '503', NULL, '2025-11-20 11:09:53', 3),
(137, 5, 'TGV-R 535', '535', NULL, '2025-11-20 11:10:12', 3),
(138, 12, 'BB 75123', '75123', '475123', '2025-11-20 11:23:00', 5),
(139, 12, 'BB 75439', '75439', '475439', '2025-11-20 11:27:23', 5),
(140, 3, 'ATER 73751', '73751', NULL, '2025-11-20 11:36:41', 17),
(141, 3, 'ATER 73750', '73750', NULL, '2025-11-20 14:53:19', 4),
(142, 2, 'AGC 76563/64', '76563', '64', '2025-11-21 13:40:43', 1),
(143, 1, 'Régiolis 51569/70M', '51569', '70M', '2025-11-21 13:43:00', 10),
(144, 1, 'Régiolis 51571/72M', '51571', '72M', '2025-11-21 13:49:54', 10),
(145, 1, 'Régiolis 51589/90M', '51589', '90M', '2025-11-21 13:52:11', 10),
(146, 3, 'ATER 73757', '73757', NULL, '2025-12-02 10:24:42', 4),
(147, 4, 'TGV-D 206', '206', NULL, '2025-12-02 11:11:00', 3),
(148, 1, 'Régiolis 51619/20M', '51619', '20M', '2025-12-02 11:13:33', 10),
(149, 4, 'TGV-D 861', '861', NULL, '2025-12-02 11:20:13', 3),
(150, 4, 'TGV-D 717', '717', NULL, '2025-12-02 11:20:32', 3),
(151, 4, 'TGV-D 296', '296', NULL, '2025-12-02 11:21:17', 3),
(152, 4, 'TGV-D 852', '852', NULL, '2025-12-02 11:21:30', 3),
(153, 4, 'TGV-D 259', '259', NULL, '2025-12-02 11:27:49', 3),
(154, 4, 'TGV-D 4719', '4719', NULL, '2025-12-02 11:30:14', 7),
(155, 4, 'TGV-D 727', '727', NULL, '2025-12-02 11:37:34', 3),
(156, 4, 'TGV-D 4730', '4730', NULL, '2025-12-02 11:38:29', 7),
(157, 4, 'TGV-D 226', '226', NULL, '2025-12-02 11:40:31', 3),
(158, 4, 'TGV-D 855', '855', NULL, '2025-12-04 15:27:10', 18),
(159, 4, 'TGV-D 711', '711', NULL, '2025-12-04 15:36:12', 3),
(160, 1, 'Régiolis 54505/06L', '54505', '06L', '2025-12-04 15:37:14', 10),
(161, 1, 'Régiolis 54529/30L', '54529', '30L', '2025-12-04 15:37:52', 10),
(162, 9, 'BB 26148', '26148', NULL, '2025-12-04 17:15:12', 9),
(163, 8, 'Corail 130', '130', NULL, '2025-12-04 17:19:26', 9),
(164, 1, 'Régiolis 85545/46M', '85545', '46M', '2025-12-04 17:20:09', 8),
(165, 11, 'BB 37523', '37523', NULL, '2025-12-04 17:25:04', 19),
(166, 4, 'TGV-D 4729', '4729', NULL, '2025-12-04 17:33:03', 7),
(167, 1, 'Régiolis 85539/40M', '85539', '40M', '2025-12-05 10:27:48', 8),
(168, 1, 'Régiolis 85551/52M', '85551', '52M', '2025-12-05 10:32:09', 8),
(169, 1, 'Régiolis 85557/58M', '85557', '58M', '2025-12-05 10:35:12', 8),
(170, 9, 'BB 26149R', '26149R', NULL, '2025-12-05 10:45:15', 9),
(171, 8, 'Corail 122', '122', NULL, '2025-12-05 10:46:58', 9),
(172, 1, 'Régiolis 85559/60M', '85559', '60M', '2025-12-05 10:48:09', 8),
(173, 9, 'BB 26144', '26144', NULL, '2025-12-05 11:03:04', 9),
(174, 13, 'BB 60161', '60161', '660161', '2025-12-05 11:13:37', 20),
(175, 13, 'BB 60053', '60053', '460053', '2025-12-05 11:19:32', 5),
(176, 8, 'Corail 142', '142', NULL, '2025-12-05 11:33:42', 2),
(177, 8, 'Corail 102', '102', NULL, '2025-12-05 11:36:32', 2),
(178, 9, 'BB 26142R', '26142R', NULL, '2025-12-05 11:38:03', 9),
(179, 4, 'TGV-D 860', '860', NULL, '2025-12-05 11:39:42', 3),
(180, 1, 'Régiolis 85555/56M', '85555', '56M', '2025-12-05 17:15:26', 8),
(181, 8, 'Corail 143', '143', NULL, '2025-12-05 17:38:40', 2),
(187, 9, 'BB 26131', '26131', NULL, '2025-12-08 15:43:51', 21),
(188, 9, 'BB 26143', '26143', NULL, '2025-12-08 16:04:51', 9),
(189, 8, 'Corail 126', '126', NULL, '2025-12-08 16:05:16', 2),
(190, 9, 'BB 26161R', '26161R', NULL, '2025-12-08 16:08:49', 9),
(191, 9, 'BB 26147', '26147', NULL, '2025-12-08 16:10:57', 9);

-- --------------------------------------------------------

--
-- Structure de la table `train_medias`
--

CREATE TABLE `train_medias` (
  `train_id` int(11) NOT NULL,
  `media_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `train_medias`
--

INSERT INTO `train_medias` (`train_id`, `media_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 3),
(5, 4),
(5, 33),
(6, 5),
(6, 6),
(6, 7),
(7, 5),
(7, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10),
(10, 11),
(10, 31),
(11, 10),
(11, 11),
(11, 50),
(12, 12),
(12, 17),
(12, 91),
(13, 13),
(13, 14),
(14, 15),
(15, 16),
(15, 200),
(15, 210),
(16, 17),
(16, 18),
(17, 20),
(17, 33),
(18, 20),
(18, 58),
(19, 19),
(20, 19),
(21, 21),
(21, 98),
(21, 180),
(21, 181),
(21, 182),
(22, 22),
(22, 45),
(23, 22),
(24, 23),
(25, 24),
(25, 191),
(26, 25),
(26, 26),
(27, 27),
(27, 28),
(28, 29),
(28, 146),
(29, 29),
(30, 30),
(31, 32),
(32, 34),
(32, 100),
(33, 34),
(34, 35),
(34, 131),
(34, 173),
(35, 36),
(35, 107),
(35, 180),
(35, 182),
(36, 36),
(36, 52),
(36, 53),
(36, 54),
(37, 37),
(37, 38),
(38, 39),
(38, 40),
(39, 40),
(39, 41),
(40, 42),
(40, 43),
(41, 43),
(42, 44),
(42, 45),
(43, 46),
(43, 207),
(43, 208),
(43, 209),
(44, 47),
(45, 48),
(45, 49),
(45, 201),
(45, 202),
(46, 50),
(47, 51),
(47, 136),
(48, 53),
(49, 53),
(50, 55),
(51, 56),
(52, 57),
(53, 58),
(53, 143),
(53, 154),
(53, 155),
(54, 59),
(55, 60),
(56, 61),
(57, 62),
(57, 151),
(58, 63),
(59, 64),
(60, 64),
(61, 65),
(62, 66),
(63, 67),
(63, 68),
(64, 69),
(64, 70),
(64, 106),
(64, 142),
(65, 71),
(66, 72),
(67, 73),
(68, 74),
(68, 145),
(68, 146),
(69, 75),
(70, 76),
(71, 77),
(71, 78),
(71, 79),
(72, 79),
(72, 99),
(72, 187),
(73, 80),
(73, 99),
(73, 100),
(73, 168),
(73, 169),
(73, 171),
(73, 172),
(73, 175),
(74, 81),
(75, 82),
(76, 82),
(77, 83),
(77, 137),
(77, 138),
(77, 219),
(77, 221),
(78, 84),
(79, 85),
(80, 86),
(80, 109),
(81, 86),
(81, 110),
(82, 87),
(83, 88),
(83, 89),
(84, 88),
(84, 89),
(85, 90),
(85, 120),
(86, 90),
(87, 91),
(88, 92),
(89, 93),
(89, 129),
(90, 94),
(90, 97),
(91, 94),
(91, 95),
(91, 96),
(91, 166),
(92, 95),
(92, 96),
(93, 97),
(93, 127),
(94, 98),
(94, 99),
(94, 103),
(94, 129),
(94, 130),
(94, 170),
(95, 99),
(96, 101),
(97, 102),
(98, 103),
(98, 105),
(99, 103),
(99, 105),
(99, 160),
(99, 161),
(100, 104),
(100, 105),
(101, 108),
(102, 109),
(103, 111),
(104, 112),
(105, 113),
(106, 114),
(107, 115),
(108, 116),
(108, 156),
(109, 117),
(110, 118),
(110, 119),
(111, 119),
(111, 141),
(112, 120),
(113, 121),
(114, 122),
(115, 122),
(115, 123),
(116, 124),
(116, 208),
(117, 124),
(118, 125),
(119, 125),
(119, 126),
(119, 168),
(119, 172),
(120, 128),
(120, 130),
(121, 132),
(121, 135),
(122, 133),
(122, 134),
(122, 175),
(123, 135),
(124, 138),
(125, 139),
(125, 142),
(126, 140),
(126, 141),
(126, 207),
(127, 143),
(128, 144),
(129, 147),
(129, 197),
(129, 222),
(130, 148),
(130, 207),
(130, 225),
(131, 149),
(131, 207),
(132, 150),
(132, 218),
(133, 152),
(133, 198),
(134, 153),
(134, 189),
(135, 154),
(135, 155),
(136, 157),
(137, 157),
(138, 158),
(139, 159),
(140, 160),
(140, 161),
(141, 162),
(142, 163),
(143, 165),
(143, 167),
(144, 164),
(144, 167),
(144, 174),
(145, 167),
(145, 169),
(146, 171),
(147, 176),
(147, 178),
(148, 177),
(149, 178),
(150, 178),
(150, 179),
(151, 178),
(151, 179),
(152, 179),
(153, 180),
(153, 181),
(154, 181),
(155, 183),
(155, 192),
(156, 184),
(156, 193),
(156, 195),
(157, 185),
(157, 193),
(158, 192),
(159, 193),
(160, 186),
(161, 186),
(162, 188),
(163, 189),
(163, 196),
(164, 189),
(164, 194),
(164, 199),
(165, 190),
(166, 191),
(167, 199),
(167, 219),
(168, 201),
(169, 202),
(169, 203),
(169, 213),
(169, 214),
(170, 204),
(171, 205),
(172, 206),
(173, 211),
(173, 225),
(174, 212),
(175, 212),
(176, 214),
(177, 215),
(178, 216),
(179, 217),
(180, 220),
(181, 223),
(187, 224),
(188, 226),
(189, 226),
(190, 227),
(191, 228);

-- --------------------------------------------------------

--
-- Structure de la table `types_train`
--

CREATE TABLE `types_train` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `constructeur` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `types_train`
--

INSERT INTO `types_train` (`id`, `nom`, `constructeur`) VALUES
(1, 'Régiolis', 'Alstom'),
(2, 'AGC', 'Bombardier'),
(3, 'ATER', 'Alstom'),
(4, 'TGV Duplex', 'Alstom'),
(5, 'TGV Réseau', 'Alstom'),
(6, 'TGV Réseau-Duplex', 'Alstom'),
(7, 'TGV POS', 'Alstom'),
(8, 'Corail réversible', 'Alstom'),
(9, 'BB 26000', 'Alstom'),
(10, 'BB 37000', 'Alstom'),
(11, 'BB 37500', 'Alstom'),
(12, 'BB 75000', 'Alstom'),
(13, 'BB 60000', 'Vossloh');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `lieux`
--
ALTER TABLE `lieux`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `livrees`
--
ALTER TABLE `livrees`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `medias`
--
ALTER TABLE `medias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_lieu2` (`id_lieu2`),
  ADD KEY `id_lieu` (`id_lieu1`);

--
-- Index pour la table `trains`
--
ALTER TABLE `trains`
  ADD PRIMARY KEY (`id`),
  ADD KEY `type_id` (`type_id`),
  ADD KEY `livree_id` (`livree_id`);

--
-- Index pour la table `train_medias`
--
ALTER TABLE `train_medias`
  ADD PRIMARY KEY (`train_id`,`media_id`),
  ADD KEY `train_medias_ibfk_2` (`media_id`);

--
-- Index pour la table `types_train`
--
ALTER TABLE `types_train`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `lieux`
--
ALTER TABLE `lieux`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `livrees`
--
ALTER TABLE `livrees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT pour la table `medias`
--
ALTER TABLE `medias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=229;

--
-- AUTO_INCREMENT pour la table `trains`
--
ALTER TABLE `trains`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=192;

--
-- AUTO_INCREMENT pour la table `types_train`
--
ALTER TABLE `types_train`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `medias`
--
ALTER TABLE `medias`
  ADD CONSTRAINT `medias_ibfk_1` FOREIGN KEY (`id_lieu1`) REFERENCES `lieux` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `medias_ibfk_2` FOREIGN KEY (`id_lieu2`) REFERENCES `lieux` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `trains`
--
ALTER TABLE `trains`
  ADD CONSTRAINT `trains_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `types_train` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trains_ibfk_2` FOREIGN KEY (`livree_id`) REFERENCES `livrees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `train_medias`
--
ALTER TABLE `train_medias`
  ADD CONSTRAINT `train_medias_ibfk_1` FOREIGN KEY (`train_id`) REFERENCES `trains` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `train_medias_ibfk_2` FOREIGN KEY (`media_id`) REFERENCES `medias` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
