"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidatesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const candidate_entity_1 = require("./entities/candidate.entity");
let CandidatesService = class CandidatesService {
    constructor(candidateRepo) {
        this.candidateRepo = candidateRepo;
    }
    async findAll(skill) {
        const candidates = await this.candidateRepo.find({
            relations: { user: true },
        });
        let result = candidates.map((c) => this.mapToDto(c));
        if (skill) {
            result = result.filter((c) => c.skills && c.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase())));
        }
        return result;
    }
    async findOne(id) {
        const candidate = await this.candidateRepo.findOne({
            where: [{ id }, { userId: id }],
            relations: { user: true },
        });
        if (!candidate) {
            throw new common_1.NotFoundException(`Candidate profile ${id} not found`);
        }
        return this.mapToDto(candidate);
    }
    async updateProfile(id, partial) {
        const candidate = await this.candidateRepo.findOne({
            where: [{ id }, { userId: id }],
        });
        if (!candidate) {
            throw new common_1.NotFoundException(`Candidate profile ${id} not found`);
        }
        if (partial.headline !== undefined)
            candidate.headline = partial.headline;
        if (partial.summary !== undefined)
            candidate.summary = partial.summary;
        if (partial.currentTitle !== undefined)
            candidate.currentTitle = partial.currentTitle;
        if (partial.experienceYears !== undefined)
            candidate.experienceYears = partial.experienceYears;
        if (partial.expectedSalary !== undefined)
            candidate.expectedSalary = partial.expectedSalary;
        if (partial.resumeUrl !== undefined)
            candidate.resumeUrl = partial.resumeUrl;
        if (partial.skills !== undefined)
            candidate.skills = partial.skills;
        if (partial.visibility !== undefined)
            candidate.visibility = partial.visibility;
        const saved = await this.candidateRepo.save(candidate);
        return this.findOne(saved.id);
    }
    mapToDto(c) {
        return {
            id: c.id,
            userId: c.userId,
            headline: c.headline || 'Software Engineer',
            summary: c.summary || '',
            currentTitle: c.currentTitle || 'Engineer',
            experienceYears: c.experienceYears || 0,
            expectedSalary: c.expectedSalary ? Number(c.expectedSalary) : 0,
            resumeUrl: c.resumeUrl || undefined,
            skills: c.skills || [],
            visibility: c.visibility || candidate_entity_1.ProfileVisibility.PUBLIC,
        };
    }
};
exports.CandidatesService = CandidatesService;
exports.CandidatesService = CandidatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(candidate_entity_1.Candidate)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CandidatesService);
//# sourceMappingURL=candidates.service.js.map