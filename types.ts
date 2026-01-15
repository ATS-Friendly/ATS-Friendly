
export interface Experience {
    id: string;
    title: string;
    company: string;
    date: string;
    desc: string;
  }
  
  export interface Education {
    id: string;
    school: string;
    degree: string;
    date: string;
  }
  
  export interface CustomSection {
    id: string;
    title: string;
    content: string;
  }
  
  export interface CvFormData {
    fullname: string;
    title: string;
    email: string;
    phone: string;
    address: string;
    birthplace: string;
    license: string;
    summary: string;
    experiences: Experience[];
    education: Education[];
    customSections: CustomSection[];
  }
  
  export interface CvDocument {
    formData: CvFormData;
    template: 'tpl-classic' | 'tpl-compact';
    theme: {
      color: string;
      font: string; // We can use specific font names later
    };
    layout: {
      fontSize: number;
      lineHeight: number;
      margin: number;
      sectionGap: number;
    };
  }
  