import React from 'react';
import { LegalLayout } from '../components/Legal/LegalLayout';

export const PrivacyPage: React.FC = () => {
    return (
        <LegalLayout title="Privacy Policy">
            <section>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">1. Data Collection</h2>
                <p>We collect minimal data necessary to provide the Be4L experience. This includes your profile information, location for quest discovery, and media you choose to share (Lores).</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">2. Partner Data</h2>
                <p>For operators, we collect business credentials and contact information to verify your identity and protect the community. Your documents are stored securely in encrypted storage.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">3. Your Rights</h2>
                <p>You have the right to access, export, or delete your data at any time. We are built for your life, not for selling your data.</p>
            </section>
        </LegalLayout>
    );
};
