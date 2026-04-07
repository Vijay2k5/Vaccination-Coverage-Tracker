import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Syringe, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate loading for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = login(email, password);
    if (!success) {
      setError('Invalid email or password');
      setIsLoading(false);
    }
    // If success, the component will unmount as user gets logged in
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700 rounded-full mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Signing you in...</h2>
          <p className="text-slate-600 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-slate-700 p-3 rounded-full">
              <Syringe className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-semibold text-slate-800">VaxTrack Login</CardTitle>
          <CardDescription className="text-center text-slate-600">
            Enter your credentials to access the vaccination tracking system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-slate-700 hover:bg-slate-800 text-white font-medium">
              Sign In
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}