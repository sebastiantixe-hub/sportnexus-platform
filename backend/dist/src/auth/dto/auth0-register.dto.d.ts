export declare class Auth0RegisterDto {
    full_name: string;
    last_name: string;
    email: string;
    password: string;
    phone: string;
    birth_date: string;
    gender: 'masculino' | 'femenino' | 'otro';
    nationality_type: 'peruano' | 'extranjero';
    document_type: 'dni' | 'pasaporte' | 'carnet_extranjeria' | 'otro';
    document_number: string;
    selected_role: 'super_admin' | 'owner' | 'coach' | 'athlete';
    accepted_terms: boolean;
    accepted_privacy_policy: boolean;
    wants_course_notifications?: boolean;
    document_type_peruano?: 'dni';
}
