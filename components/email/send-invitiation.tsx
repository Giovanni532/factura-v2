import React from 'react';

interface InvitationEmailProps {
    companyName: string;
    inviterName: string;
    inviteeName: string;
    inviteeEmail: string;
    role: string;
    invitationLink: string;
}

export const InvitationEmail: React.FC<InvitationEmailProps> = ({
    companyName,
    inviterName,
    inviteeName,
    inviteeEmail,
    role,
    invitationLink,
}) => {
    return (
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h1 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '24px' }}>
                    Invitation à rejoindre {companyName}
                </h1>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
                    Bonjour {inviteeName},
                </p>

                <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
                    {inviterName} vous invite à rejoindre l&apos;équipe de <strong>{companyName}</strong> en tant que <strong>{role}</strong>.
                </p>

                <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
                    Vous pourrez accéder à la plateforme de facturation et de gestion comptable de l&apos;entreprise.
                </p>

                <div style={{ textAlign: 'center', margin: '30px 0' }}>
                    <a
                        href={invitationLink}
                        style={{
                            backgroundColor: '#007bff',
                            color: '#ffffff',
                            padding: '12px 30px',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            display: 'inline-block',
                        }}
                    >
                        Accepter l&apos;invitation
                    </a>
                </div>

                <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                    Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :
                </p>

                <p style={{ color: '#007bff', fontSize: '14px', wordBreak: 'break-all', marginBottom: '20px' }}>
                    {invitationLink}
                </p>

                <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
                    Cette invitation expirera dans 7 jours.
                </p>

                <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                    Si vous avez des questions, n&apos;hésitez pas à contacter {inviterName}.
                </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '12px' }}>
                <p>Cet email a été envoyé par {companyName}</p>
            </div>
        </div>
    );
};

export default InvitationEmail;
