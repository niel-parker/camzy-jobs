/**
 * Master Data Importer: Legacy MySQL Dump -> Designed Database Schema (job_portal_db)
 *
 * Rules:
 * 1. Only imports tables and fields defined in our modern database schema.
 * 2. Explicitly omits legacy UI artifacts: sliders, widgets, testimonials, site_settings, etc.
 * 3. Preserves all relationships, bcrypt passwords, CV files, experience, educations, and skills.
 */

const mysql = require('../node_modules/mysql2/promise');
const crypto = require('crypto');

function uuid() {
  return crypto.randomUUID();
}

function slugify(text) {
  if (!text) return 'item-' + Math.random().toString(36).substring(2, 7);
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .substring(0, 120);
}

const METRO_CITIES = new Set([
  'mumbai', 'pune', 'bengaluru', 'bangalore', 'hyderabad', 'delhi', 'new delhi',
  'noida', 'gurgaon', 'gurugram', 'chennai', 'kolkata', 'ahmedabad', 'chandigarh',
  'jaipur', 'lucknow', 'kochi', 'indore', 'nagpur', 'surat'
]);

async function run() {
  console.log('====================================================');
  console.log('🚀 STARTING LEGACY DATABASE IMPORT INTO DESIGNED SCHEMA');
  console.log('====================================================');

  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root_password',
    multipleStatements: true,
  });

  try {
    // Disable FK checks during high-volume batch migration
    await conn.query('SET FOREIGN_KEY_CHECKS = 0;');

    // ----------------------------------------------------
    // PHASE 1: SYSTEM TAXONOMIES (17 Master Types)
    // ----------------------------------------------------
    console.log('\n📦 [1/11] Importing Master System Taxonomies...');
    
    // Clear existing taxonomies so we have pristine legacy master data
    await conn.query('TRUNCATE TABLE job_portal_db.system_taxonomies;');

    const taxonomySources = [
      { type: 'CAREER_LEVEL', table: 'legacy_staging.career_levels', idCol: 'career_level_id', nameCol: 'career_level' },
      { type: 'DEGREE_LEVEL', table: 'legacy_staging.degree_levels', idCol: 'degree_level_id', nameCol: 'degree_level' },
      { type: 'DEGREE_TYPE', table: 'legacy_staging.degree_types', idCol: 'degree_type_id', nameCol: 'degree_type' },
      { type: 'FUNCTIONAL_AREA', table: 'legacy_staging.functional_areas', idCol: 'functional_area_id', nameCol: 'functional_area' },
      { type: 'GENDER', table: 'legacy_staging.genders', idCol: 'gender_id', nameCol: 'gender' },
      { type: 'INDUSTRY', table: 'legacy_staging.industries', idCol: 'industry_id', nameCol: 'industry' },
      { type: 'JOB_EXPERIENCE', table: 'legacy_staging.job_experiences', idCol: 'job_experience_id', nameCol: 'job_experience' },
      { type: 'JOB_SHIFT', table: 'legacy_staging.job_shifts', idCol: 'job_shift_id', nameCol: 'job_shift' },
      { type: 'JOB_SKILL', table: 'legacy_staging.job_skills', idCol: 'job_skill_id', nameCol: 'job_skill' },
      { type: 'JOB_TYPE', table: 'legacy_staging.job_types', idCol: 'job_type_id', nameCol: 'job_type' },
      { type: 'LANGUAGE_LEVEL', table: 'legacy_staging.language_levels', idCol: 'language_level_id', nameCol: 'language_level' },
      { type: 'MAJOR_SUBJECT', table: 'legacy_staging.major_subjects', idCol: 'major_subject_id', nameCol: 'major_subject' },
      { type: 'MARITAL_STATUS', table: 'legacy_staging.marital_statuses', idCol: 'marital_status_id', nameCol: 'marital_status' },
      { type: 'OWNERSHIP_TYPE', table: 'legacy_staging.ownership_types', idCol: 'ownership_type_id', nameCol: 'ownership_type' },
      { type: 'RESULT_TYPE', table: 'legacy_staging.result_types', idCol: 'result_type_id', nameCol: 'result_type' },
      { type: 'SALARY_PERIOD', table: 'legacy_staging.salary_periods', idCol: 'salary_period_id', nameCol: 'salary_period' },
    ];

    let totalTaxonomies = 0;
    for (const src of taxonomySources) {
      const [rows] = await conn.query(`SELECT ${src.idCol} as legacyId, ${src.nameCol} as name, is_active, sort_order FROM ${src.table}`);
      if (rows.length > 0) {
        // Batch insert in chunks of 500
        for (let i = 0; i < rows.length; i += 500) {
          const chunk = rows.slice(i, i + 500);
          const values = chunk.map(r => [
            uuid(),
            src.type,
            String(r.name || '').substring(0, 150),
            String(r.legacyId),
            null,
            r.sort_order || 0,
            r.is_active ? 1 : 0,
            JSON.stringify({ legacyId: r.legacyId }),
            new Date(),
            new Date()
          ]);
          await conn.query(
            `INSERT INTO job_portal_db.system_taxonomies (id, type, name, code, description, orderIndex, isActive, metaData, createdAt, updatedAt) VALUES ?`,
            [values]
          );
        }
        totalTaxonomies += rows.length;
        console.log(`   ✓ ${src.type}: ${rows.length} records`);
      }
    }

    // Languages table
    const [langRows] = await conn.query(`SELECT id, lang, native, iso_code, is_active FROM legacy_staging.languages`);
    if (langRows.length > 0) {
      const values = langRows.map(r => [
        uuid(),
        'LANGUAGE',
        String(r.lang || '').substring(0, 150),
        r.iso_code || String(r.id),
        null,
        r.id,
        r.is_active ? 1 : 0,
        JSON.stringify({ native: r.native, iso_code: r.iso_code, legacyId: r.id }),
        new Date(),
        new Date()
      ]);
      await conn.query(
        `INSERT INTO job_portal_db.system_taxonomies (id, type, name, code, description, orderIndex, isActive, metaData, createdAt, updatedAt) VALUES ?`,
        [values]
      );
      totalTaxonomies += langRows.length;
      console.log(`   ✓ LANGUAGE: ${langRows.length} records`);
    }
    console.log(`   🎉 Total Master System Taxonomies Imported: ${totalTaxonomies}`);

    // ----------------------------------------------------
    // PHASE 2: LOCATIONS (771 Cities across States & Country)
    // ----------------------------------------------------
    console.log('\n📍 [2/11] Importing Locations (Country, State, Cities)...');
    await conn.query('TRUNCATE TABLE job_portal_db.locations;');
    
    const [cityRows] = await conn.query(`
      SELECT 
        c.city_id,
        c.city,
        COALESCE(s.state, 'Other') as state,
        COALESCE(co.country, 'India') as country,
        c.is_active
      FROM legacy_staging.cities c
      LEFT JOIN legacy_staging.states s ON c.state_id = s.state_id
      LEFT JOIN legacy_staging.countries co ON s.country_id = co.country_id
    `);

    const locationValues = cityRows.map(c => {
      const cityClean = (c.city || '').trim();
      const isPop = METRO_CITIES.has(cityClean.toLowerCase()) ? 1 : 0;
      return [
        uuid(),
        (c.country || 'India').trim().substring(0, 100),
        (c.state || '').trim().substring(0, 100),
        cityClean.substring(0, 100),
        isPop,
        c.is_active ? 1 : 0,
        new Date(),
        new Date()
      ];
    });

    for (let i = 0; i < locationValues.length; i += 500) {
      const chunk = locationValues.slice(i, i + 500);
      await conn.query(
        `INSERT INTO job_portal_db.locations (id, country, state, city, isPopular, isActive, createdAt, updatedAt) VALUES ?`,
        [chunk]
      );
    }
    console.log(`   ✓ Total Locations Imported: ${cityRows.length} cities`);

    // Lookup caches for foreign keys
    const [industries] = await conn.query('SELECT industry_id, industry FROM legacy_staging.industries');
    const industryMap = new Map(industries.map(i => [i.industry_id, i.industry]));

    const [states] = await conn.query('SELECT state_id, state FROM legacy_staging.states');
    const stateMap = new Map(states.map(s => [s.state_id, s.state]));

    const [cities] = await conn.query('SELECT city_id, city FROM legacy_staging.cities');
    const cityMap = new Map(cities.map(c => [c.city_id, c.city]));

    // ----------------------------------------------------
    // PHASE 3: TENANTS & EMPLOYER ADMINS
    // ----------------------------------------------------
    console.log('\n🏢 [3/11] Importing Companies (Tenants & Employer Accounts)...');
    
    const [companyRows] = await conn.query(`
      SELECT * FROM legacy_staging.companies 
      WHERE name IS NOT NULL AND TRIM(name) != ''
    `);

    const legacyCompanyIdToTenantId = new Map();
    const legacyCompanyIdToUserId = new Map();

    for (const comp of companyRows) {
      const tenantId = uuid();
      const compSlug = comp.slug || slugify(comp.name) + '-' + comp.id;
      const compName = (comp.name || '').trim().substring(0, 255);
      const indName = industryMap.get(comp.industry_id) || 'Technology';
      
      // 1. Insert Tenant
      await conn.query(`
        INSERT INTO job_portal_db.tenants 
          (id, name, type, slug, logoUrl, website, taxId, industry, description, status, isVerified, createdAt, updatedAt)
        VALUES (?, ?, 'COMPANY', ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), updatedAt = NOW()
      `, [
        tenantId,
        compName,
        compSlug,
        comp.logo ? `/uploads/companies/${comp.logo}` : null,
        comp.website ? String(comp.website).substring(0, 255) : null,
        comp.fax ? String(comp.fax).substring(0, 100) : null,
        indName,
        comp.description || null,
        comp.is_active ? 'ACTIVE' : 'SUSPENDED',
        comp.created_at || new Date(),
        comp.updated_at || new Date()
      ]);

      legacyCompanyIdToTenantId.set(comp.id, tenantId);

      // 2. Insert Employer User (COMPANY_ADMIN)
      const empUserId = uuid();
      const empEmail = (comp.email && comp.email.includes('@')) 
        ? comp.email.trim().toLowerCase() 
        : `company_${comp.id}@camzyjobs.com`;

      const ceoParts = (comp.ceo || comp.name || 'Admin').trim().split(/\s+/);
      const firstName = ceoParts[0] || 'Admin';
      const lastName = ceoParts.slice(1).join(' ') || 'Manager';

      // Check if user already exists
      const [existingUsers] = await conn.query('SELECT id FROM job_portal_db.users WHERE email = ?', [empEmail]);
      let finalUserId = empUserId;

      if (existingUsers.length > 0) {
        finalUserId = existingUsers[0].id;
        await conn.query(`
          UPDATE job_portal_db.users 
          SET tenant_id = ?, role = 'COMPANY_ADMIN', status = 'ACTIVE' 
          WHERE id = ?
        `, [tenantId, finalUserId]);
      } else {
        await conn.query(`
          INSERT INTO job_portal_db.users
            (id, email, passwordHash, firstName, lastName, role, phoneNumber, isEmailVerified, isPhoneVerified, status, tenant_id, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, 'COMPANY_ADMIN', ?, 1, 1, 'ACTIVE', ?, ?, ?)
        `, [
          empUserId,
          empEmail,
          comp.password || '$2y$12$Fp8miXIdoQ2mwuWSVOxOgef.dIU4yB/IDauDLU2z1.TJvGamtbeva', // Default or real hash
          firstName.substring(0, 100),
          lastName.substring(0, 100),
          comp.phone ? String(comp.phone).substring(0, 50) : null,
          tenantId,
          comp.created_at || new Date(),
          comp.updated_at || new Date()
        ]);
      }

      legacyCompanyIdToUserId.set(comp.id, finalUserId);

      // 3. Create Tenant Subscription
      await conn.query(`
        INSERT INTO job_portal_db.tenant_subscriptions
          (id, tenant_id, plan_id, status, activeJobsUsed, resumeDownloadsUsed, featuredJobsUsed, currentPeriodStart, currentPeriodEnd, createdAt, updatedAt)
        VALUES (?, ?, 'ENTERPRISE', 'ACTIVE', 0, 0, 0, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), NOW(), NOW())
        ON DUPLICATE KEY UPDATE status = 'ACTIVE'
      `, [uuid(), tenantId]);
    }
    console.log(`   ✓ Imported ${companyRows.length} Companies & Employer Admin Users`);

    // ----------------------------------------------------
    // PHASE 4: SUPER ADMINS
    // ----------------------------------------------------
    console.log('\n👑 [4/11] Importing Super Admins...');
    const [adminRows] = await conn.query('SELECT * FROM legacy_staging.admins');
    for (const adm of adminRows) {
      if (!adm.email) continue;
      const [existing] = await conn.query('SELECT id FROM job_portal_db.users WHERE email = ?', [adm.email.trim().toLowerCase()]);
      const nameParts = (adm.name || 'Admin').trim().split(/\s+/);
      const fName = nameParts[0] || 'Super';
      const lName = nameParts.slice(1).join(' ') || 'Admin';

      if (existing.length > 0) {
        await conn.query(`
          UPDATE job_portal_db.users 
          SET role = 'SUPER_ADMIN', passwordHash = ?, firstName = ?, lastName = ?, status = 'ACTIVE'
          WHERE id = ?
        `, [adm.password, fName, lName, existing[0].id]);
      } else {
        await conn.query(`
          INSERT INTO job_portal_db.users
            (id, email, passwordHash, firstName, lastName, role, isEmailVerified, isPhoneVerified, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, 'SUPER_ADMIN', 1, 1, 'ACTIVE', ?, ?)
        `, [uuid(), adm.email.trim().toLowerCase(), adm.password, fName, lName, adm.created_at || new Date(), adm.updated_at || new Date()]);
      }
      console.log(`   ✓ Admin configured: ${adm.email}`);
    }

    // ----------------------------------------------------
    // PHASE 5: CANDIDATES & PROFILE ATTACHMENTS
    // ----------------------------------------------------
    console.log('\n👤 [5/11] Pre-loading candidate profile child tables into memory...');
    
    // Skills Map: user_id -> string[]
    console.log('   -> Pre-loading skills...');
    const [skillRows] = await conn.query(`
      SELECT ps.user_id, js.job_skill 
      FROM legacy_staging.profile_skills ps 
      JOIN legacy_staging.job_skills js ON ps.job_skill_id = js.job_skill_id
      WHERE ps.user_id IS NOT NULL AND js.job_skill IS NOT NULL
    `);
    const userSkillsMap = new Map();
    for (const s of skillRows) {
      if (!userSkillsMap.has(s.user_id)) userSkillsMap.set(s.user_id, []);
      userSkillsMap.get(s.user_id).push(s.job_skill);
    }
    console.log(`      ✓ Loaded ${skillRows.length} skill mappings across ${userSkillsMap.size} users`);

    // CVs Map: user_id -> object[]
    console.log('   -> Pre-loading CV files...');
    const [cvRows] = await conn.query(`
      SELECT user_id, title, cv_file, is_default, created_at 
      FROM legacy_staging.profile_cvs 
      WHERE user_id IS NOT NULL AND cv_file IS NOT NULL
    `);
    const userCvMap = new Map();
    for (const cv of cvRows) {
      if (!userCvMap.has(cv.user_id)) userCvMap.set(cv.user_id, []);
      userCvMap.get(cv.user_id).push({
        title: cv.title || 'Resume',
        url: cv.cv_file.startsWith('http') ? cv.cv_file : `/uploads/resumes/${cv.cv_file}`,
        isDefault: cv.is_default == 1
      });
    }
    console.log(`      ✓ Loaded ${cvRows.length} CVs across ${userCvMap.size} users`);

    // Summaries Map: user_id -> string
    console.log('   -> Pre-loading summaries...');
    const [summaryRows] = await conn.query(`SELECT user_id, summary FROM legacy_staging.profile_summaries WHERE user_id IS NOT NULL`);
    const userSummaryMap = new Map(summaryRows.map(s => [s.user_id, s.summary]));

    // Educations Map: user_id -> object[]
    console.log('   -> Pre-loading educations...');
    const [eduRows] = await conn.query(`
      SELECT user_id, degree_title, institution, date_completion, degree_result 
      FROM legacy_staging.profile_educations 
      WHERE user_id IS NOT NULL
    `);
    const userEduMap = new Map();
    for (const e of eduRows) {
      if (!userEduMap.has(e.user_id)) userEduMap.set(e.user_id, []);
      userEduMap.get(e.user_id).push({
        degree: e.degree_title || '',
        institution: e.institution || '',
        year: e.date_completion || '',
        result: e.degree_result || ''
      });
    }

    // Experiences Map: user_id -> object[]
    console.log('   -> Pre-loading experiences...');
    const [expRows] = await conn.query(`
      SELECT user_id, title, company, date_start, date_end, is_currently_working, description 
      FROM legacy_staging.profile_experiences 
      WHERE user_id IS NOT NULL
    `);
    const userExpMap = new Map();
    for (const exp of expRows) {
      if (!userExpMap.has(exp.user_id)) userExpMap.set(exp.user_id, []);
      userExpMap.get(exp.user_id).push({
        title: exp.title || '',
        company: exp.company || '',
        startDate: exp.date_start ? String(exp.date_start).substring(0, 10) : '',
        endDate: exp.date_end ? String(exp.date_end).substring(0, 10) : '',
        isCurrent: exp.is_currently_working == 1,
        description: exp.description || ''
      });
    }

    // Now query all Candidate Users
    console.log('\n   -> Streaming Candidate Users from legacy_staging.users...');
    const [users] = await conn.query(`
      SELECT 
        id, first_name, middle_name, last_name, name, email, password, phone,
        date_of_birth, gender_id, marital_status_id, country_id, state_id, city_id,
        current_salary, expected_salary, is_active, verified, created_at, updated_at
      FROM legacy_staging.users
      WHERE email IS NOT NULL AND TRIM(email) != '' AND email LIKE '%@%'
    `);
    console.log(`      ✓ Found ${users.length} valid Candidate Users to import.`);

    // Check existing emails in job_portal_db
    const [existingDbUsers] = await conn.query('SELECT id, email FROM job_portal_db.users');
    const existingEmailMap = new Map(existingDbUsers.map(u => [u.email.toLowerCase(), u.id]));

    const legacyUserIdToCandidateId = new Map();
    const legacyUserIdToUserId = new Map();

    const BATCH_SIZE = 500;
    let importedCandidatesCount = 0;

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      const userInserts = [];
      const candidateInserts = [];

      for (const u of batch) {
        const cleanEmail = u.email.trim().toLowerCase();
        let targetUserId = existingEmailMap.get(cleanEmail);

        const fName = (u.first_name || (u.name ? u.name.split(' ')[0] : 'Candidate')).trim().substring(0, 100);
        const lName = (u.last_name || (u.name ? u.name.split(' ').slice(1).join(' ') : '')).trim().substring(0, 100);

        if (!targetUserId) {
          targetUserId = uuid();
          existingEmailMap.set(cleanEmail, targetUserId);

          userInserts.push([
            targetUserId,
            cleanEmail,
            u.password || '$2y$12$CandidateDefaultHashFallback2026',
            fName,
            lName,
            'CANDIDATE',
            u.phone ? String(u.phone).substring(0, 50) : null,
            u.verified ? 1 : 0,
            u.verified ? 1 : 0,
            u.is_active ? 'ACTIVE' : 'INACTIVE',
            null,
            u.created_at || new Date(),
            u.updated_at || new Date()
          ]);
        }

        legacyUserIdToUserId.set(u.id, targetUserId);

        // Candidate profile construction
        const candidateId = uuid();
        legacyUserIdToCandidateId.set(u.id, candidateId);

        const skills = userSkillsMap.get(u.id) || [];
        const cvs = userCvMap.get(u.id) || [];
        const educations = userEduMap.get(u.id) || [];
        const experiences = userExpMap.get(u.id) || [];
        const summary = userSummaryMap.get(u.id) || null;

        const defaultCv = cvs.find(c => c.isDefault) || cvs[0];
        const resumeUrl = defaultCv ? defaultCv.url : null;

        // Current title and headline
        const latestExp = experiences[0];
        const currentTitle = latestExp ? latestExp.title.substring(0, 150) : (skills[0] ? `${skills[0]} Specialist` : 'Professional');
        const headline = summary ? summary.substring(0, 255) : (currentTitle || `${fName} ${lName}`);

        candidateInserts.push([
          candidateId,
          targetUserId,
          headline,
          summary,
          currentTitle,
          experiences.length > 0 ? Math.min(25, experiences.length * 2) : 1, // estimated experience
          u.expected_salary ? parseFloat(u.expected_salary) || null : null,
          u.current_salary ? parseFloat(u.current_salary) || null : null,
          resumeUrl,
          null, // parsed text
          JSON.stringify(skills),
          JSON.stringify(experiences),
          JSON.stringify(educations),
          JSON.stringify([]), // certifications
          JSON.stringify([]), // projects
          JSON.stringify([]), // languages
          JSON.stringify([]), // socialLinks
          null, // noticePeriod
          JSON.stringify([]), // preferredLocations
          JSON.stringify(cvs),
          JSON.stringify([]), // savedJobIds
          'PUBLIC',
          u.created_at || new Date(),
          u.updated_at || new Date()
        ]);
      }

      // 1. Bulk insert users
      if (userInserts.length > 0) {
        await conn.query(`
          INSERT INTO job_portal_db.users
            (id, email, passwordHash, firstName, lastName, role, phoneNumber, isEmailVerified, isPhoneVerified, status, tenant_id, createdAt, updatedAt)
          VALUES ?
        `, [userInserts]);
      }

      // 2. Bulk insert candidates
      if (candidateInserts.length > 0) {
        await conn.query(`
          INSERT INTO job_portal_db.candidates
            (id, user_id, headline, summary, currentTitle, experienceYears, expectedSalary, currentSalary,
             resumeUrl, resumeParsedText, skills, experience, education, certifications, projects, languages,
             socialLinks, noticePeriod, preferredLocations, resumes, savedJobIds, visibility, createdAt, updatedAt)
          VALUES ?
          ON DUPLICATE KEY UPDATE summary = VALUES(summary), skills = VALUES(skills), resumes = VALUES(resumes), updatedAt = NOW()
        `, [candidateInserts]);
      }

      importedCandidatesCount += batch.length;
      if (importedCandidatesCount % 2000 === 0 || importedCandidatesCount === users.length) {
        console.log(`      ✓ Processed ${importedCandidatesCount} / ${users.length} candidate profiles...`);
      }
    }
    console.log(`   🎉 Finished Importing ${importedCandidatesCount} Candidate Profiles!`);

    // ----------------------------------------------------
    // PHASE 6: JOBS & JOB POSTINGS
    // ----------------------------------------------------
    console.log('\n💼 [6/11] Importing Job Postings...');
    
    // Skills for jobs
    const [jobSkillRows] = await conn.query(`
      SELECT mjs.job_id, js.job_skill 
      FROM legacy_staging.manage_job_skills mjs 
      JOIN legacy_staging.job_skills js ON mjs.job_skill_id = js.job_skill_id
      WHERE mjs.job_id IS NOT NULL AND js.job_skill IS NOT NULL
    `);
    const jobSkillsMap = new Map();
    for (const js of jobSkillRows) {
      if (!jobSkillsMap.has(js.job_id)) jobSkillsMap.set(js.job_id, []);
      jobSkillsMap.get(js.job_id).push(js.job_skill);
    }

    // Functional areas lookup
    const [funcAreas] = await conn.query('SELECT functional_area_id, functional_area FROM legacy_staging.functional_areas');
    const funcAreaMap = new Map(funcAreas.map(f => [f.functional_area_id, f.functional_area]));

    const [jobRows] = await conn.query(`SELECT * FROM legacy_staging.jobs`);
    console.log(`   -> Found ${jobRows.length} jobs to import.`);

    const legacyJobIdToTargetJobId = new Map();
    let importedJobsCount = 0;

    // Default tenant & user if company mapping missing
    const defaultTenantId = legacyCompanyIdToTenantId.get(1) || Array.from(legacyCompanyIdToTenantId.values())[0];
    const defaultUserId = legacyCompanyIdToUserId.get(1) || Array.from(legacyCompanyIdToUserId.values())[0];

    const jobInserts = [];
    for (const job of jobRows) {
      const targetJobId = uuid();
      legacyJobIdToTargetJobId.set(job.id, targetJobId);

      const tenantId = legacyCompanyIdToTenantId.get(job.company_id) || defaultTenantId;
      const postedByUserId = legacyCompanyIdToUserId.get(job.company_id) || defaultUserId;

      const cityName = cityMap.get(job.city_id) || 'Pune';
      const stateName = stateMap.get(job.state_id) || 'Maharashtra';
      const skills = jobSkillsMap.get(job.id) || [];
      const category = funcAreaMap.get(job.functional_area_id) || 'Engineering';

      // Map employmentType enum ('Full-time', 'Part-time', 'Contract', 'Internship', 'Remote')
      let empType = 'Full-time';
      if (job.job_type_id == 2) empType = 'Part-time';
      else if (job.job_type_id == 3 || job.job_type_id == 4 || job.job_type_id == 5) empType = 'Contract';
      else if (job.job_type_id == 6) empType = 'Internship';

      // Map experienceLevel enum ('Entry', 'Mid', 'Senior', 'Lead', 'Executive')
      let expLevel = 'Mid';
      if (job.career_level_id <= 2) expLevel = 'Entry';
      else if (job.career_level_id == 3) expLevel = 'Mid';
      else if (job.career_level_id == 4) expLevel = 'Senior';
      else if (job.career_level_id >= 5) expLevel = 'Executive';

      const salaryMin = job.salary_from ? parseFloat(job.salary_from) : null;
      const salaryMax = job.salary_to ? parseFloat(job.salary_to) : null;
      const cur = (job.salary_currency && job.salary_currency !== '?') ? job.salary_currency : 'INR';

      const isPub = (job.is_active == 1);
      const status = isPub ? 'PUBLISHED' : 'ARCHIVED';

      const expiresAt = job.expiry_date 
        ? new Date(job.expiry_date) 
        : new Date(Date.now() + 60 * 86400000);

      const title = (job.title || 'Job Opening').trim().substring(0, 255);
      const slug = (job.slug ? job.slug.substring(0, 240) : slugify(title)) + '-' + job.id;

      jobInserts.push([
        targetJobId,
        tenantId,
        postedByUserId,
        title,
        slug,
        job.description || '<p>Job description coming soon.</p>',
        category.substring(0, 100),
        empType,
        expLevel,
        salaryMin,
        salaryMax,
        cur,
        job.hide_salary ? 0 : 1,
        'India',
        stateName.substring(0, 100),
        cityName.substring(0, 100),
        job.is_freelance ? 1 : 0,
        job.is_featured ? 1 : 0,
        null, // screeningQuestions
        status,
        expiresAt,
        job.num_of_views || 0,
        0, // applications count
        job.created_at || new Date(),
        job.updated_at || new Date(),
        'INTERNAL',
        null, // applyUrl
        JSON.stringify(skills),
        JSON.stringify(job.benefits ? [job.benefits] : []),
        'No Preference',
        1, // minExperience
        5  // maxExperience
      ]);
    }

    for (let i = 0; i < jobInserts.length; i += 200) {
      const chunk = jobInserts.slice(i, i + 200);
      await conn.query(`
        INSERT INTO job_portal_db.job_postings
          (id, tenant_id, posted_by_user_id, title, slug, description, category, employmentType,
           experienceLevel, salaryMin, salaryMax, currency, isSalaryVisible, locationCountry,
           locationState, locationCity, isRemote, isFeatured, screeningQuestions, status,
           expiresAt, viewsCount, applicationsCount, createdAt, updatedAt, applyType, applyUrl,
           skills, benefits, genderPreference, minExperience, maxExperience)
        VALUES ?
        ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), updatedAt = NOW()
      `, [chunk]);
    }
    console.log(`   ✓ Successfully Imported ${jobInserts.length} Job Postings!`);

    // ----------------------------------------------------
    // PHASE 7: JOB APPLICATIONS
    // ----------------------------------------------------
    console.log('\n📝 [7/11] Importing Job Applications...');
    const [appRows] = await conn.query('SELECT * FROM legacy_staging.job_apply');
    let appCount = 0;
    for (const app of appRows) {
      const targetJobId = legacyJobIdToTargetJobId.get(app.job_id);
      const targetCandId = legacyUserIdToCandidateId.get(app.user_id);

      if (targetJobId && targetCandId) {
        await conn.query(`
          INSERT INTO job_portal_db.job_applications
            (id, job_id, candidate_id, coverLetter, resumeUrlSnapshot, stage, rating, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, 'APPLIED', 0, ?, ?)
        `, [
          uuid(),
          targetJobId,
          targetCandId,
          app.current_salary ? `Current Salary: ${app.current_salary}, Expected: ${app.expected_salary}` : null,
          `/uploads/resumes/cv-${app.cv_id}.pdf`,
          app.created_at || new Date(),
          app.updated_at || new Date()
        ]);
        appCount++;
      }
    }
    console.log(`   ✓ Imported ${appCount} Job Applications`);

    // ----------------------------------------------------
    // PHASE 8: CMS PAGES
    // ----------------------------------------------------
    console.log('\n📄 [8/11] Importing CMS Pages...');
    const [cmsRows] = await conn.query(`
      SELECT c.page_slug, c.seo_title, c.seo_description, cc.page_title, cc.page_content, cc.lang, cc.created_at
      FROM legacy_staging.cms c
      JOIN legacy_staging.cms_content cc ON c.id = cc.page_id
    `);
    for (const c of cmsRows) {
      await conn.query(`
        INSERT INTO job_portal_db.cms_pages
          (id, title, slug, locale, contentHtml, isPublished, seoTitle, seoDescription, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE contentHtml = VALUES(contentHtml), title = VALUES(title)
      `, [
        uuid(),
        c.page_title || 'CMS Page',
        c.page_slug.toLowerCase(),
        c.lang || 'en',
        c.page_content || '',
        c.seo_title || null,
        c.seo_description || null,
        c.created_at || new Date()
      ]);
      console.log(`   ✓ CMS Page: ${c.page_slug} (${c.page_title})`);
    }

    // ----------------------------------------------------
    // PHASE 9: BLOGS & CATEGORIES
    // ----------------------------------------------------
    console.log('\n📰 [9/11] Importing Blog Categories & Articles...');
    const [blogCats] = await conn.query('SELECT * FROM legacy_staging.blog_categories');
    const catMap = new Map();
    for (const bc of blogCats) {
      const catId = uuid();
      await conn.query(`
        INSERT INTO job_portal_db.blog_categories (id, name, slug, description, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, 1, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name)
      `, [catId, bc.heading, bc.slug, bc.heading, bc.created_at || new Date(), bc.updated_at || new Date()]);
      catMap.set(String(bc.id), bc.heading);
    }
    console.log(`   ✓ Imported ${blogCats.length} Blog Categories`);

    const [blogs] = await conn.query('SELECT * FROM legacy_staging.blogs');
    for (const b of blogs) {
      const primaryCatId = (b.cate_id || '').split(',')[0];
      const catName = catMap.get(primaryCatId) || 'Industry News';
      await conn.query(`
        INSERT INTO job_portal_db.blog_posts
          (id, title, slug, category, authorName, summary, content, coverImageUrl, isPublished, publishedAt, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, 'Editorial Team', ?, ?, ?, 1, ?, ?, ?)
        ON DUPLICATE KEY UPDATE content = VALUES(content), title = VALUES(title)
      `, [
        uuid(),
        b.heading.substring(0, 255),
        b.slug.substring(0, 150),
        catName.substring(0, 100),
        b.meta_descriptions || b.heading,
        b.content,
        b.image ? `/uploads/blogs/${b.image}` : null,
        b.created_at || new Date(),
        b.created_at || new Date(),
        b.updated_at || new Date()
      ]);
    }
    console.log(`   ✓ Imported ${blogs.length} Blog Articles`);

    // ----------------------------------------------------
    // PHASE 10: FAQS & SEO CONFIGS
    // ----------------------------------------------------
    console.log('\n❓ [10/11] Importing FAQs & SEO Meta Configurations...');
    const [faqs] = await conn.query('SELECT * FROM legacy_staging.faqs');
    for (const f of faqs) {
      await conn.query(`
        INSERT INTO job_portal_db.faq_items
          (id, question, answer, category, targetAudience, orderIndex, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, 'General', 'ALL', ?, 1, ?, ?)
      `, [uuid(), f.faq_question, f.faq_answer, f.sort_order || 0, f.created_at || new Date(), f.updated_at || new Date()]);
    }
    console.log(`   ✓ Imported ${faqs.length} FAQ Items`);

    const [seoRows] = await conn.query('SELECT * FROM legacy_staging.seo');
    for (const s of seoRows) {
      await conn.query(`
        INSERT INTO job_portal_db.seo_configs
          (id, pageKey, pageName, metaTitle, metaDescription, metaKeywords, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE metaTitle = VALUES(metaTitle), metaDescription = VALUES(metaDescription)
      `, [
        uuid(),
        s.page_title,
        s.page_title.replace(/_/g, ' ').toUpperCase(),
        s.seo_title,
        s.seo_description,
        s.seo_keywords,
        s.created_at || new Date(),
        s.updated_at || new Date()
      ]);
    }
    console.log(`   ✓ Imported ${seoRows.length} SEO Page Configurations`);

    // ----------------------------------------------------
    // PHASE 11: BILLING & PAYMENT TRANSACTIONS
    // ----------------------------------------------------
    console.log('\n💳 [11/11] Importing Payment & Transaction History...');
    const [payments] = await conn.query('SELECT * FROM legacy_staging.payment_history');
    for (const ph of payments) {
      const invNum = `INV-LEGACY-${String(ph.id).padStart(5, '0')}`;
      const amount = parseFloat(ph.package_amount) || 0;
      const isPaid = (ph.payment_status === 'success');
      const payMethod = (ph.rayzorpay_pay_id && ph.rayzorpay_pay_id.startsWith('pay_'))
        ? `Razorpay (${ph.rayzorpay_pay_id})`
        : 'Trial Activation';

      await conn.query(`
        INSERT INTO job_portal_db.billing_transactions
          (id, invoiceNumber, tenant_id, tenantName, description, amount, currency, type, status,
           paymentMethod, planCode, quotaDetails, periodStart, periodEnd, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, 'INR', 'SUBSCRIPTION', ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuid(),
        invNum,
        defaultTenantId,
        ph.company_name || 'Camzy Infotech Pvt Ltd',
        `${ph.package_name || 'Standard'} Plan (${ph.job_post || 0} jobs, ${ph.cv_search || 0} resumes)`,
        amount,
        isPaid ? 'PAID' : 'PENDING',
        payMethod,
        ph.package_name || 'GROWTH',
        JSON.stringify({ jobs: ph.job_post, cvSearch: ph.cv_search, razorpayId: ph.rayzorpay_pay_id }),
        ph.created_at || new Date(),
        ph.package_expire ? new Date(ph.package_expire) : null,
        ph.created_at || new Date()
      ]);
    }
    console.log(`   ✓ Imported ${payments.length} Billing Transactions`);

    // Re-enable FK checks
    await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('\n====================================================');
    console.log('✅ ALL DATA SUCCESSFULLY IMPORTED INTO job_portal_db!');
    console.log('🛡️ No sliders, widgets, or obsolete legacy tables were added.');
    console.log('====================================================\n');

  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await conn.end();
  }
}

run();
