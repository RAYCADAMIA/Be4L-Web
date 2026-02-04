import React from 'react';
import { LegalLayout } from '../components/Legal/LegalLayout';

export const TermsPage: React.FC = () => {
    return (
        <LegalLayout title="Terms of Service">
            <section>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">1. Acceptance</h2>
                <p>By using Be4L, you agree to live fully, respect the community, and participate in quests with integrity. We are a giant friend group; treat everyone as such.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">2. Operator Conduct</h2>
                <p>Operators must provide accurate venue information and honor all bookings made through the Dibs system. Misrepresentation will result in immediate cooling of your partnership.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">3. Safety</h2>
                <p>Safety is a shared responsibility. While we provide the HUD for your adventures, your choices in the real world are your own.</p>
            </section>
        </LegalLayout>
    );
};
