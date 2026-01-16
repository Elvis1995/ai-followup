import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Mail,
  Phone,
  MessageSquare,
  Bell,
  Shield,
  CreditCard,
  Save,
  CheckCircle,
} from "lucide-react";

type Customer = {
  id: string;
  name?: string;
  company_name?: string;
  api_key: string;
  created_at?: string;
};

const Settings = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [customerError, setCustomerError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadingCustomer(true);
        setCustomerError(null);

        const res = await fetch("http://localhost:3001/me");
        const data = await res.json();

        if (!res.ok || data?.success === false) {
          throw new Error(data?.error || `Failed to load /me (${res.status})`);
        }

        const c: Customer = data.customer || data; // stödjer både {customer:...} och direkt-object
        setCustomer(c);

        if (c?.api_key) {
          localStorage.setItem("apiKey", c.api_key);
        }
      } catch (e: any) {
        setCustomerError(e.message);
      } finally {
        setLoadingCustomer(false);
      }
    })();
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const webhookSource = "website";
  const webhookUrl = `http://localhost:3001/webhook/${webhookSource}`;

  const apiKey = customer?.api_key || "";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and integrations
          </p>
        </div>
        <Button variant="hero" onClick={handleSave}>
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="gap-2">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Channels</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            🔌 <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
        </TabsList>

        {/* Company settings */}
        <TabsContent value="company" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card space-y-6">
              <h2 className="text-xl font-semibold">Company Information</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    defaultValue={user?.company}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                  <Input id="taxId" placeholder="XX-XXXXXXX" className="h-12" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Business St"
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="12345"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Stockholm" className="h-12" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-6">
              <h2 className="text-xl font-semibold">Contact Person</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Name</Label>
                  <Input
                    id="contactName"
                    defaultValue={user?.name}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    defaultValue={user?.email}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="+46 70 123 45 67"
                    className="h-12"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Channel settings */}
        <TabsContent value="channels" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Email */}
            <div className="p-6 rounded-xl border border-border bg-card space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Email</h2>
                  <p className="text-sm text-muted-foreground">
                    Sender settings
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sender Name</Label>
                  <Input defaultValue={user?.company} className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label>Sender Email</Label>
                  <Input defaultValue="info@company.com" className="h-10" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            {/* SMS */}
            <div className="p-6 rounded-xl border border-border bg-card space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="font-semibold">SMS</h2>
                  <p className="text-sm text-muted-foreground">Phone settings</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sender Number</Label>
                  <Input defaultValue="+46 70 000 00 00" className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label>Sender Name (if supported)</Label>
                  <Input defaultValue={user?.company} className="h-10" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="p-6 rounded-xl border border-border bg-card space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h2 className="font-semibold">WhatsApp</h2>
                  <p className="text-sm text-muted-foreground">
                    WhatsApp Business
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your WhatsApp Business account
                  </p>
                  <Button variant="outline" size="sm">
                    Connect WhatsApp
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch disabled />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="p-6 rounded-xl border border-border bg-card space-y-6">
            <h2 className="text-xl font-semibold">Notifications</h2>

            <div className="space-y-4">
              {[
                {
                  title: "New leads",
                  description: "Get notified when a new lead comes in",
                  defaultChecked: true,
                },
                {
                  title: "Booked meetings",
                  description: "Notification when AI books a meeting",
                  defaultChecked: true,
                },
                {
                  title: "Follow-up status",
                  description: "Daily summary of follow-ups",
                  defaultChecked: true,
                },
                {
                  title: "Failed deliveries",
                  description: "Notification if email/SMS could not be delivered",
                  defaultChecked: true,
                },
                {
                  title: "Weekly report",
                  description: "Weekly summary of activity",
                  defaultChecked: false,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Switch defaultChecked={item.defaultChecked} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card space-y-6">
              <h2 className="text-xl font-semibold">Password</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current password</Label>
                  <Input type="password" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>New password</Label>
                  <Input type="password" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm new password</Label>
                  <Input type="password" className="h-12" />
                </div>
                <Button variant="outline">Update password</Button>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-6">
              <h2 className="text-xl font-semibold">Two-factor authentication</h2>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-4">
                  Add an extra layer of security to your account with two-factor
                  authentication.
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-6">
          <div className="p-6 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Pro Plan</h2>
                <p className="text-muted-foreground">
                  Unlimited leads and follow-ups
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">$49</p>
                <p className="text-sm text-muted-foreground">/month</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card space-y-4">
              <h2 className="text-xl font-semibold">Payment method</h2>
              <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-4">
                <div className="w-12 h-8 rounded bg-gradient-to-br from-primary to-accent" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline">Change payment method</Button>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-4">
              <h2 className="text-xl font-semibold">Billing history</h2>
              <div className="space-y-2">
                {["Jan 2024", "Dec 2023", "Nov 2023"].map((month) => (
                  <div
                    key={month}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <span>{month}</span>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="p-6 rounded-xl border border-border bg-card space-y-6">
            <h2 className="text-xl font-semibold">API Integration</h2>
            <p className="text-sm text-muted-foreground">
              Send leads from your website directly into the system using our webhook.
            </p>

            {loadingCustomer ? (
              <div>Loading...</div>
            ) : customerError ? (
              <div className="text-destructive">Error: {customerError}</div>
            ) : !customer ? (
              <div>No customer found.</div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Your API Key</Label>
                  <div className="flex gap-2">
                    <Input value={apiKey} readOnly />
                    <Button
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(apiKey)}
                      disabled={!apiKey}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    (We also store this automatically in your browser for the dashboard.)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input value={webhookUrl} readOnly />
                    <Button
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(webhookUrl)}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use <b>website</b> as source for now. Later we’ll let you create multiple sources.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Example (JavaScript)</Label>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`fetch("${webhookUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${apiKey}"
  },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@test.com",
    phone: "0701234567",
    message: "I want a quote"
  })
});`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
