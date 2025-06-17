export const minimalTemplate = {
    id: "minimal-template",
    name: "Minimal",
    description: "Template minimaliste et épuré pour un look moderne et clean",
    html: `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Facture</title>
        <style>{{CSS}}</style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="invoice-header">
                <div class="header-content">
                    <div class="invoice-title">
                        <h1>Facture</h1>
                        <span class="invoice-number">{{invoice.number}}</span>
                    </div>
                    <div class="invoice-dates">
                        <div class="date-item">
                            <span class="date-label">Émise le</span>
                            <span class="date-value">{{invoice.issueDate}}</span>
                        </div>
                        <div class="date-item">
                            <span class="date-label">Échéance</span>
                            <span class="date-value">{{invoice.dueDate}}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="parties-section">
                <div class="party from-party">
                    <h3>De</h3>
                    <div class="party-details">
                        {{#if company.logo}}
                        <img src="{{company.logo}}" alt="{{company.name}}" class="party-logo">
                        {{/if}}
                        <div class="party-info">
                            <p class="party-name">{{company.name}}</p>
                            <p>{{company.address}}</p>
                            <p>{{company.city}}, {{company.postalCode}}</p>
                            <p>{{company.country}}</p>
                            <div class="contact-info">
                                <p>{{company.email}}</p>
                                <p>{{company.phone}}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="party to-party">
                    <h3>À</h3>
                    <div class="party-details">
                        <div class="party-info">
                            <p class="party-name">{{client.name}}</p>
                            <p>{{client.address}}</p>
                            <p>{{client.city}}, {{client.postalCode}}</p>
                            <p>{{client.country}}</p>
                            <div class="contact-info">
                                <p>{{client.email}}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="items-section">
                <div class="items-list">
                    {{#each items}}
                    <div class="item-row">
                        <div class="item-description">
                            <span class="item-name">{{description}}</span>
                        </div>
                        <div class="item-details">
                            <span class="item-quantity">{{quantity}} ×</span>
                            <span class="item-price">{{unitPrice}}€</span>
                            <span class="item-total">{{total}}€</span>
                        </div>
                    </div>
                    {{/each}}
                </div>
            </div>

            <div class="summary-section">
                <div class="summary-content">
                    <div class="summary-row">
                        <span>Sous-total</span>
                        <span>{{invoice.subtotal}}€</span>
                    </div>
                    <div class="summary-row">
                        <span>TVA ({{invoice.taxRate}}%)</span>
                        <span>{{invoice.taxAmount}}€</span>
                    </div>
                    <div class="summary-row total-row">
                        <span>Total</span>
                        <span>{{invoice.total}}€</span>
                    </div>
                </div>
            </div>

            {{#if invoice.notes}}
            <div class="notes-section">
                <p>{{invoice.notes}}</p>
            </div>
            {{/if}}
        </div>
    </body>
    </html>
    `,
    css: `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #2d3748;
        background: #ffffff;
        padding: 40px 20px;
    }

    .invoice-container {
        max-width: 700px;
        margin: 0 auto;
        background: white;
    }

    .invoice-header {
        margin-bottom: 60px;
    }

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 30px;
        border-bottom: 1px solid #e2e8f0;
    }

    .invoice-title h1 {
        font-size: 32px;
        font-weight: 300;
        color: #1a202c;
        margin-bottom: 8px;
        letter-spacing: -0.5px;
    }

    .invoice-number {
        font-size: 14px;
        color: #718096;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .invoice-dates {
        text-align: right;
    }

    .date-item {
        margin-bottom: 12px;
    }

    .date-label {
        display: block;
        font-size: 12px;
        color: #a0aec0;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 4px;
    }

    .date-value {
        display: block;
        font-size: 14px;
        color: #2d3748;
        font-weight: 500;
    }

    .parties-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 60px;
        margin-bottom: 60px;
    }

    .party h3 {
        font-size: 12px;
        color: #a0aec0;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 20px;
        font-weight: 600;
    }

    .party-details {
        display: flex;
        gap: 15px;
        align-items: flex-start;
    }

    .party-logo {
        max-width: 40px;
        max-height: 40px;
        object-fit: contain;
        flex-shrink: 0;
    }

    .party-name {
        font-size: 16px;
        font-weight: 600;
        color: #1a202c;
        margin-bottom: 8px;
    }

    .party-info p {
        font-size: 14px;
        color: #4a5568;
        margin-bottom: 4px;
    }

    .contact-info {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #f7fafc;
    }

    .contact-info p {
        font-size: 13px;
        color: #718096;
    }

    .items-section {
        margin-bottom: 40px;
    }

    .items-list {
        border-top: 1px solid #e2e8f0;
    }

    .item-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 0;
        border-bottom: 1px solid #f7fafc;
    }

    .item-row:last-child {
        border-bottom: 1px solid #e2e8f0;
    }

    .item-description {
        flex: 1;
    }

    .item-name {
        font-size: 15px;
        color: #2d3748;
        font-weight: 500;
    }

    .item-details {
        display: flex;
        align-items: center;
        gap: 20px;
        font-size: 14px;
        color: #718096;
    }

    .item-total {
        font-weight: 600;
        color: #2d3748;
        min-width: 80px;
        text-align: right;
    }

    .summary-section {
        margin-bottom: 40px;
    }

    .summary-content {
        margin-left: auto;
        max-width: 300px;
    }

    .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        font-size: 14px;
        color: #4a5568;
    }

    .summary-row:not(.total-row) {
        border-bottom: 1px solid #f7fafc;
    }

    .total-row {
        border-top: 2px solid #e2e8f0;
        margin-top: 12px;
        padding-top: 20px;
        font-size: 18px;
        font-weight: 600;
        color: #1a202c;
    }

    .notes-section {
        padding: 30px;
        background: #f7fafc;
        border-radius: 8px;
        margin-top: 40px;
    }

    .notes-section p {
        font-size: 14px;
        color: #4a5568;
        line-height: 1.6;
    }

    @media (max-width: 640px) {
        .header-content {
            flex-direction: column;
            gap: 30px;
        }
        
        .invoice-dates {
            text-align: left;
        }
        
        .parties-section {
            grid-template-columns: 1fr;
            gap: 40px;
        }
        
        .item-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }
        
        .item-details {
            justify-content: space-between;
            width: 100%;
        }
    }

    @media print {
        body {
            padding: 0;
        }
        
        .notes-section {
            background: white;
            border: 1px solid #e2e8f0;
        }
    }
    `
}; 