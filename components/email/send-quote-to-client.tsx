import React from 'react';

interface QuoteEmailProps {
    clientName: string;
    companyName: string;
    quoteNumber: string;
    quoteAmount: string;
    quoteDate: string;
    validUntil: string;
    subject: string;
    message: string;
    quoteLink: string;
}

export const QuoteEmail: React.FC<QuoteEmailProps> = ({
    clientName,
    companyName,
    quoteNumber,
    quoteAmount,
    quoteDate,
    validUntil,
    subject,
    message,
    quoteLink,
}) => {
    return (
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h1 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '24px' }}>
                    Devis #{quoteNumber}
                </h1>
                <p style={{ color: '#666', margin: '0', fontSize: '16px' }}>
                    {companyName}
                </p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
                    Bonjour {clientName},
                </p>

                {message && (
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '15px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        borderLeft: '4px solid #007bff'
                    }}>
                        <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '0' }}>
                            {message}
                        </p>
                    </div>
                )}

                <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ color: '#333', margin: '0 0 15px 0', fontSize: '18px' }}>
                        Détails du devis
                    </h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#666', fontSize: '14px' }}>Numéro de devis :</span>
                        <span style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' }}>#{quoteNumber}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#666', fontSize: '14px' }}>Date du devis :</span>
                        <span style={{ color: '#333', fontSize: '14px' }}>{quoteDate}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#666', fontSize: '14px' }}>Valide jusqu&apos;au :</span>
                        <span style={{ color: '#333', fontSize: '14px' }}>{validUntil}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#666', fontSize: '14px' }}>Montant total :</span>
                        <span style={{ color: '#333', fontSize: '16px', fontWeight: 'bold' }}>{quoteAmount}</span>
                    </div>
                </div>

                <div style={{
                    backgroundColor: '#fff3cd',
                    padding: '15px',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    border: '1px solid #ffeaa7'
                }}>
                    <p style={{ color: '#856404', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
                        <strong>Important :</strong> Ce devis est valable jusqu&apos;au {validUntil}. Passé cette date, les prix pourront être révisés.
                    </p>
                </div>

                <div style={{ textAlign: 'center', margin: '30px 0' }}>
                    <a
                        href={quoteLink}
                        style={{
                            backgroundColor: '#007bff',
                            color: '#ffffff',
                            padding: '12px 30px',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            display: 'inline-block',
                            marginRight: '10px',
                        }}
                    >
                        Voir le devis
                    </a>


                </div>

                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <a
                        href={`${quoteLink}?action=accept`}
                        style={{
                            backgroundColor: '#28a745',
                            color: '#ffffff',
                            padding: '12px 30px',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            display: 'inline-block',
                            marginRight: '10px',
                        }}
                    >
                        Accepter le devis
                    </a>

                    <a
                        href={`${quoteLink}?action=reject`}
                        style={{
                            backgroundColor: '#dc3545',
                            color: '#ffffff',
                            padding: '12px 30px',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            display: 'inline-block',
                        }}
                    >
                        Refuser le devis
                    </a>
                </div>

                <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                    Si vous avez des questions concernant ce devis ou si vous souhaitez des modifications, n&apos;hésitez pas à nous contacter.
                </p>

                <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.6' }}>
                    Nous restons à votre disposition pour toute information complémentaire,
                    <br />
                    <strong>L&apos;équipe {companyName}</strong>
                </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '12px' }}>
                <p>Cet email a été envoyé par {companyName}</p>
                <p>Pour toute question, contactez-nous à support@{companyName.toLowerCase().replace(/\s+/g, '')}.com</p>
            </div>
        </div>
    );
};

export default QuoteEmail;
