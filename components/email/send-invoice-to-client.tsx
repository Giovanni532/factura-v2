import React from 'react';

interface InvoiceEmailProps {
    clientName: string;
    companyName: string;
    invoiceNumber: string;
    invoiceAmount: string;
    invoiceDate: string;
    dueDate: string;
    subject: string;
    message: string;
    invoiceLink: string;
    pdfUrl?: string;
}

export const InvoiceEmail: React.FC<InvoiceEmailProps> = ({
    clientName,
    companyName,
    invoiceNumber,
    invoiceAmount,
    invoiceDate,
    dueDate,
    subject,
    message,
    invoiceLink,
    pdfUrl,
}) => {
    return (
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h1 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '24px' }}>
                    Facture #{invoiceNumber}
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
                        Détails de la facture
                    </h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#666', fontSize: '14px' }}>Numéro de facture :</span>
                        <span style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' }}>#{invoiceNumber}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#666', fontSize: '14px' }}>Date de facturation :</span>
                        <span style={{ color: '#333', fontSize: '14px' }}>{invoiceDate}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#666', fontSize: '14px' }}>Date d&apos;échéance :</span>
                        <span style={{ color: '#333', fontSize: '14px' }}>{dueDate}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#666', fontSize: '14px' }}>Montant total :</span>
                        <span style={{ color: '#333', fontSize: '16px', fontWeight: 'bold' }}>{invoiceAmount}</span>
                    </div>
                </div>

                <div style={{ textAlign: 'center', margin: '30px 0' }}>
                    <a
                        href={invoiceLink}
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
                        Voir la facture
                    </a>

                    {pdfUrl && (
                        <a
                            href={pdfUrl}
                            style={{
                                backgroundColor: '#28a745',
                                color: '#ffffff',
                                padding: '12px 30px',
                                textDecoration: 'none',
                                borderRadius: '6px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                display: 'inline-block',
                            }}
                        >
                            Télécharger PDF
                        </a>
                    )}
                </div>

                <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                    Si vous avez des questions concernant cette facture, n&apos;hésitez pas à nous contacter.
                </p>

                <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.6' }}>
                    Merci pour votre confiance,
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

export default InvoiceEmail;
