import { credentialRepository } from './credential.repository';
import { ICredential } from './credential.model';

export class CredentialService {
    async getMyCredentials(studentId: string): Promise<ICredential[]> {
        return credentialRepository.findByStudentId(studentId);
    }

    async getCredentialByPublicId(credentialId: string): Promise<ICredential | null> {
        return credentialRepository.findByCredentialId(credentialId);
    }
}

export const credentialService = new CredentialService();
