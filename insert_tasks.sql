-- ==============================================================================
-- 1. PASTIKAN PROFIL USER SUDAH TERSEDIA DI TABEL public.profiles
--    (Mencegah error foreign key: tasks_user_id_fkey)
-- ==============================================================================
INSERT INTO public.profiles (id, full_name, email)
VALUES ('6e8a33a9-fb19-4c05-8935-694127f6af06', 'User', 'user@example.com')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 2. INSERT ATAU UPDATE KE TABEL public.tasks
-- ==============================================================================
INSERT INTO public.tasks (
  id,
  user_id,
  title,
  description,
  category,
  progress,
  is_completed,
  due_date,
  created_at,
  updated_at,
  is_pinned
) VALUES
  ('676f3ea5-64c0-4cf7-97ae-5f5cb18e1bd3', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Reminder UTP', NULL, 'Praktikum', 100, true, '2026-10-01 00:00:00+00', '2026-09-30 14:55:23.180971+00', '2026-10-01 03:52:38.944+00', false),
  ('85fbd336-61ad-4a46-9e76-9fce7108aa6a', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Submit TKS', NULL, 'Praktikum', 100, true, '2026-10-01 00:00:00+00', '2026-10-01 04:08:39.403402+00', '2026-10-02 01:15:49.958+00', false),
  ('1519e3b3-f125-4aa5-97cb-221c1fae130c', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Finishing Order', NULL, 'Organisasi', 100, true, '2026-10-02 00:00:00+00', '2026-10-01 04:09:03.32933+00', '2026-10-18 14:05:30.975+00', false),
  ('11a0e96d-1b1c-4a65-8f2e-a00b198ace46', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Finalisasi Blockchain', NULL, 'Kuliah', 100, true, '2026-10-02 00:00:00+00', '2026-09-29 07:57:39.377187+00', '2026-10-04 10:12:42.234+00', false),
  ('8f06ec08-860b-4de2-a2fe-75bb743997e0', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Record Blockchain', NULL, 'Kuliah', 100, true, '2026-10-03 00:00:00+00', '2026-09-29 06:55:26.587879+00', '2026-10-04 10:12:51.629+00', false),
  ('145b6a2d-6642-441c-a473-3a465cffaf96', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Improvement Phase', NULL, 'Organisasi', 100, true, '2026-10-04 00:00:00+00', '2026-10-02 01:53:46.922949+00', '2026-10-04 10:10:01.553+00', false),
  ('76dce736-28a9-4722-86de-cc304b39750e', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Submit Laporan IoT', NULL, 'Praktikum', 100, true, '2026-10-06 00:00:00+00', '2026-10-04 11:22:28.035724+00', '2026-10-06 14:06:36.343+00', false),
  ('9a3a5087-7ef4-40e5-81d4-65bfe5f3a9f1', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Buat Soal UTP', NULL, 'Praktikum', 100, true, '2026-10-06 00:00:00+00', '2026-10-06 14:01:35.19006+00', '2026-10-08 07:42:02.093+00', false),
  ('6ce60c19-63e1-40ca-b414-e32992cc5210', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Kerjain TKS', NULL, 'Praktikum', 100, true, '2026-10-06 00:00:00+00', '2026-10-05 09:01:44.375566+00', '2026-10-08 09:32:29.154+00', false),
  ('2103fb3e-e74e-4574-bb98-17fef85c3778', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Belajar IoT', NULL, 'Kuliah', 100, true, '2026-10-07 00:00:00+00', '2026-10-06 14:00:51.399112+00', '2026-10-08 04:09:34.115+00', false),
  ('2a2d892d-d6d7-4bb2-9508-1bcc686564dd', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Nyicil TKS', NULL, 'Kuliah', 100, true, '2026-10-07 00:00:00+00', '2026-10-06 14:00:39.701162+00', '2026-10-08 04:09:36.692+00', false),
  ('63eca6a7-2d2c-49db-ba6b-352c2fbb18da', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Poster Kaiser', NULL, 'Organisasi', 100, true, '2026-10-07 00:00:00+00', '2026-10-04 11:20:29.322838+00', '2026-10-08 09:32:06.888+00', false),
  ('d670d6cb-884a-40cd-992b-fbefe390941a', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Latihan UTP TKS', NULL, 'Praktikum', 100, true, '2026-10-08 00:00:00+00', '2026-10-06 14:01:13.138167+00', '2026-10-09 15:00:16.025+00', false),
  ('0c215a58-8720-4c3d-9e03-40ae451bd18d', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'UTS IoT', 'Materi dr awal sampai komunikasi data, multiple choice. pastikan laptopnya bisa jalan untuk UTS dg SEB.', 'Kuliah', 100, true, '2026-10-08 00:00:00+00', '2026-10-06 06:12:45.584066+00', '2026-10-08 04:10:22.132+00', false),
  ('3da4ebad-aad9-49ce-9ce0-2e4ee4cebb8f', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Submit Laporan TKS', NULL, 'Praktikum', 100, true, '2026-10-08 00:00:00+00', '2026-10-04 11:22:50.190034+00', '2026-10-08 15:41:59.488+00', false),
  ('458f5b5c-b89f-4740-a961-0f87c3a98030', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'UTP TKS', NULL, 'Praktikum', 100, true, '2026-10-09 00:00:00+00', '2026-10-04 11:23:03.001033+00', '2026-10-09 15:00:17.876+00', false),
  ('bd2e11d9-c311-40f5-9663-91a508ae5faa', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'UTS Data Mining', NULL, 'Kuliah', 100, true, '2026-10-09 00:00:00+00', '2026-10-05 09:01:05.563173+00', '2026-10-09 03:06:59.128+00', false),
  ('fd904b87-a4ef-4f81-9f60-2207f7878927', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'TF Fai', NULL, 'Lainnya', 100, true, '2026-10-09 00:00:00+00', '2026-10-06 14:23:22.248786+00', '2026-10-10 14:05:44.053+00', false),
  ('8c01d955-8404-45ee-b23e-af6c84576632', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'UTP', NULL, 'Kuliah', 100, true, '2026-10-10 00:00:00+00', '2026-09-30 12:28:01.192593+00', '2026-10-10 11:19:58.961+00', false),
  ('d01422da-a746-4be8-b84a-ebb94dae524a', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Kerjain Metopen', NULL, 'Kuliah', 0, false, '2026-10-11 00:00:00+00', '2026-09-29 07:58:10.745837+00', '2026-10-06 05:43:12.906+00', false),
  ('fc151de1-f273-4042-b25d-f00c43351eb4', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'UTS Blockchain', NULL, 'Kuliah', 100, true, '2026-10-12 00:00:00+00', '2026-10-10 11:21:00.484501+00', '2026-10-12 03:49:06.662+00', false),
  ('637b78d8-7c1e-4b04-9adf-0d949e8343db', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'UTS MPTI', NULL, 'Kuliah', 100, true, '2026-10-12 00:00:00+00', '2026-10-12 11:44:20.552635+00', '2026-10-12 11:44:21.187+00', false),
  ('b140ec16-4791-4c12-a581-35f8dbf9ba8d', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Reminder Template Laporan', NULL, 'Praktikum', 100, true, '2026-10-12 00:00:00+00', '2026-10-01 04:04:52.454743+00', '2026-10-12 16:02:47.856+00', false),
  ('e5764124-89f8-4189-891f-5753c6da8b93', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'UTS TKS', NULL, 'Kuliah', 100, true, '2026-10-13 00:00:00+00', '2026-10-06 06:04:23.308666+00', '2026-10-15 00:24:44.574+00', false),
  ('75010cec-2f9f-4617-ae54-9c137b2d97fd', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'UTS EtProf', NULL, 'Kuliah', 100, true, '2026-10-13 00:00:00+00', '2026-10-12 11:44:39.351288+00', '2026-10-15 00:24:42.398+00', false),
  ('6ce80a6b-c827-47bc-94d2-f5ff51902613', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Fix Revisi BE', NULL, 'Organisasi', 100, true, '2026-10-14 00:00:00+00', '2026-10-05 09:02:02.455987+00', '2026-10-15 00:25:11.245+00', false),
  ('b2f893f1-a27c-4764-acab-a18b8691716b', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Remed IoT', NULL, 'Kuliah', 100, true, '2026-10-15 00:00:00+00', '2026-10-13 03:40:25.209672+00', '2026-10-15 16:10:54.378+00', false),
  ('c3972c65-0679-458a-94a5-8f7f7f8b0ca3', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'UTS IR', NULL, 'Kuliah', 100, true, '2026-10-15 00:00:00+00', '2026-10-05 09:01:23.692209+00', '2026-10-15 16:10:56.448+00', false),
  ('ff1ebcc3-21c8-4402-ae13-0e0d8bb66112', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Submi Presentasi', NULL, 'Kuliah', 100, true, '2026-10-16 00:00:00+00', '2026-10-16 03:24:31.286305+00', '2026-10-17 14:49:32.084+00', false),
  ('76bc6b16-caa7-46c1-91e7-d96f0d1fb687', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Meet Mentor', '⏰ 20.00 WIB
🔗 To be announced', 'Organisasi', 100, true, '2026-10-16 00:00:00+00', '2026-10-15 00:54:02.087277+00', '2026-10-17 14:49:34.113+00', false),
  ('93a54bd7-3e63-44cb-8e9a-6d6e9c80938e', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Nyuci Motor', NULL, 'Lainnya', 0, false, '2026-10-17 00:00:00+00', '2026-09-30 08:27:34.977396+00', '2026-10-15 00:24:36.923+00', false),
  ('0d26fa72-254f-4fd2-9365-2d285b912a85', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Raion Academy', NULL, 'Organisasi', 100, true, '2026-10-17 00:00:00+00', '2026-09-24 09:47:52.011932+00', '2026-10-17 14:49:37.334+00', false),
  ('79ca3c5d-074e-4fc0-b9d1-d3ce6fab58a9', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Cuci Sepatu', NULL, 'Lainnya', 0, false, '2026-10-17 00:00:00+00', '2026-10-04 11:21:27.641323+00', '2026-10-15 00:24:31.449+00', false),
  ('70e6f47f-ed02-4521-9785-6dfd9d35f483', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Buat Soal Prak ASD', NULL, 'Praktikum', 100, true, '2026-10-18 00:00:00+00', '2026-10-16 03:23:45.292444+00', '2026-10-18 14:05:26.479+00', false),
  ('32de4bd8-b4a0-4675-a2d7-4c1eaa32d890', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Reminder Raion Academy', 'Halo guys jangan lupa untuk pengerjaan tugas Raion Academy Mobile Engineer Tugasnya seputar sliching desain yg sudah dikasih di ppt dengan Widget UI Flutter dan dikerjakan dalam 1 file saja yaw', 'Organisasi', 100, true, '2026-10-18 00:00:00+00', '2026-10-17 14:49:54.709811+00', '2026-10-21 12:56:09.131+00', false),
  ('036cf1e0-8355-4890-812a-205042ec1314', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Laprak IoT', NULL, 'Praktikum', 100, true, '2026-10-20 00:00:00+00', '2026-10-16 03:23:16.71261+00', '2026-10-21 12:43:00.825+00', false),
  ('c9be7281-fba2-4616-a1f1-e9fdf58d986c', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Debug IoT', NULL, 'Praktikum', 100, true, '2026-10-21 00:00:00+00', '2026-10-16 03:23:27.818567+00', '2026-10-21 12:43:04.079+00', false),
  ('8a6c7ee7-c58d-4919-8f38-7dce26462a0b', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Submit IoT', NULL, 'Kuliah', 100, true, '2026-10-21 00:00:00+00', '2026-10-16 03:26:08.805488+00', '2026-10-22 00:19:50.417+00', false),
  ('9ebefaf2-2046-42bb-9413-6160a95505f1', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Submit Prak TKS', NULL, 'Praktikum', 100, true, '2026-10-22 00:00:00+00', '2026-10-16 03:24:08.275288+00', '2026-10-22 12:49:49.212+00', false),
  ('4b6206ab-78f2-495c-a0a3-c6085ff8395a', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Meet Academy', NULL, 'Organisasi', 100, true, '2026-10-23 00:00:00+00', '2026-10-21 14:47:41.615632+00', '2026-10-27 16:34:38.73+00', false),
  ('82d6a4a6-8f4a-4aa8-a86c-5447a7995183', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'ME Workshop', NULL, 'Organisasi', 100, true, '2026-10-24 00:00:00+00', '2026-10-19 06:13:19.64052+00', '2026-10-27 16:34:42.023+00', false),
  ('ad89a0f1-f88a-408d-af93-2ebb63044fb9', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Harusnya Meet Web Dev', NULL, 'Organisasi', 100, true, '2026-10-25 00:00:00+00', '2026-10-16 03:22:55.883933+00', '2026-10-27 16:34:44.684+00', false),
  ('a7c7938f-b542-4ea7-844b-064ee4b17031', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Raion Academy', NULL, 'Organisasi', 100, true, '2026-10-25 00:00:00+00', '2026-09-24 09:48:10.112878+00', '2026-10-27 16:34:49.295+00', false),
  ('7c407dd5-b377-44c0-97f0-2561cf04b626', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Submit Etprof', NULL, 'Kuliah', 100, true, '2026-10-25 00:00:00+00', '2026-10-22 12:50:09.168932+00', '2026-10-27 16:34:46.815+00', false),
  ('6f6d1569-8965-424d-8ebd-60464da9ed88', '6e8a33a9-fb19-4c05-8935-694127f6af06', 'Pithing Androzone', NULL, 'Organisasi', 100, true, '2026-10-31 00:00:00+00', '2026-10-02 01:54:15.685484+00', '2026-11-01 11:37:00.342+00', false)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  progress = EXCLUDED.progress,
  is_completed = EXCLUDED.is_completed,
  due_date = EXCLUDED.due_date,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at;
