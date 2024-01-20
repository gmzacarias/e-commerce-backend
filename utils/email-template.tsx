type EmailTemplateProps = {
    firstName: string;
}

export function EmailTemplate({ firstName }: EmailTemplateProps) {
    return (
        <div>hola soy el mail {firstName}</div>
    )
}
