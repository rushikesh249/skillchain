import { skillRepository } from './skill.repository';
import { ISkill } from './skill.model';

export class SkillService {
    async getAllSkills(): Promise<ISkill[]> {
        return skillRepository.findAll();
    }

    async getSkillBySlug(slug: string): Promise<ISkill | null> {
        return skillRepository.findBySlug(slug);
    }

    async getSkillById(id: string): Promise<ISkill | null> {
        return skillRepository.findById(id);
    }
}

export const skillService = new SkillService();
