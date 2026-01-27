
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { HelpCircle, FileText, MessageCircle } from 'lucide-react';

export const CommonHelp = () => {
    const faqs = [
        {
            q: "How do I verify my skills?",
            a: "Submit a GitHub repository link for a specific skill. Our AI agents will analyze your code and generate a confidence score. If approved, you'll receive a verified credential."
        },
        {
            q: "How does the blockchain verification work?",
            a: "Once your submission is approved, a unique Soulbound Token (SBT) is minted on the blockchain. This token serves as immutable proof of your skill and cannot be transferred."
        },
        {
            q: "As an employer, how do I find candidates?",
            a: "Go to the 'Find Talent' page to search for candidates by skill. You can view their skill scores and use credits to unlock their full contact information."
        },
        {
            q: "What happens if my submission is rejected?",
            a: "You'll receive feedback on why it was rejected. You can improve your code based on the feedback and resubmit for verification."
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Help & Support</h1>
                <p className="text-gray-500 mt-1">Find answers to common questions and get support.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-medium transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Documentation
                        </CardTitle>
                        <CardDescription>Read detailed guides on how to use the platform.</CardDescription>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-medium transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-green-600" />
                            Contact Support
                        </CardTitle>
                        <CardDescription>Get in touch with our team for assistance.</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <div className="pt-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-gray-500" />
                    Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <Card key={index} className="border-gray-200">
                            <CardContent className="pt-6">
                                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="text-center pt-8 text-sm text-gray-500">
                <p>Need more help? Email us at <a href="mailto:support@skillchain.demo" className="text-indigo-600 hover:underline">support@skillchain.demo</a></p>
            </div>
        </div>
    );
};
