import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Pharmacy Login</CardTitle>
                    <CardDescription>Sign in to access your audit history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button className="w-full h-12 relative" variant="outline">
                        {/* Google Icon Mock */}
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.8-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                            />
                        </svg>
                        Sign in with Google
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                        This is a prototype. No real auth connected.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
