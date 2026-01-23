import { Skill, ISkill } from './skill.model';

export class SkillRepository {
    async findAll(): Promise<ISkill[]> {
        return Skill.find().sort({ name: 1 });
    }

    async findBySlug(slug: string): Promise<ISkill | null> {
        return Skill.findOne({ slug: slug.toLowerCase().trim() });
    }

    async findById(id: string): Promise<ISkill | null> {
        return Skill.findById(id);
    }

    async create(data: { name: string; slug: string; description?: string }): Promise<ISkill> {
        const skill = new Skill({
            ...data,
            slug: data.slug.toLowerCase().trim(),
        });
        return skill.save();
    }

    async findByIds(ids: string[]): Promise<ISkill[]> {
        return Skill.find({ _id: { $in: ids } });
    }
}

export const skillRepository = new SkillRepository();
