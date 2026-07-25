import { LucideIcon, Download, ShieldCheck, Globe, Settings, Terminal, HelpCircle } from "lucide-react";

export type TaskType = 'install' | 'check-file' | 'vpn' | 'privacy' | 'script' | 'custom';

export interface Step {
  id: string;
  title: string;
  description: string;
  whyItMatters: string[];
  type: 'info' | 'check' | 'input' | 'action';
  validation?: {
    type: 'url' | 'extension' | 'boolean';
    pattern?: string;
    message?: string;
  };
}

export interface TaskFlow {
  id: TaskType;
  title: string;
  description: string;
  icon: LucideIcon;
  steps: Step[];
}

export const tasks: TaskFlow[] = [
  {
    id: 'install',
    title: 'Safely Download & Install',
    description: 'Step-by-step guide to downloading software without getting viruses or bloatware.',
    icon: Download,
    steps: [
      {
        id: 'source-check',
        title: 'Identify the Source',
        description: 'Where are you trying to download this file from? Paste the URL below.',
        whyItMatters: [
          'Official sites are the safest place to get software.',
          'Third-party download sites often bundle "junk" software.',
          'Scammers buy ads that look like download buttons.'
        ],
        type: 'input',
        validation: {
          type: 'url',
          message: 'Please enter a valid URL starting with http:// or https://'
        }
      },
      {
        id: 'site-legitimacy',
        title: 'Verify Site Legitimacy',
        description: 'Look at the address bar. Does the domain name match the software name exactly?',
        whyItMatters: [
          'Phishing sites use slight misspellings (e.g., "vlc-player-download.com" instead of "videolan.org").',
          'HTTPS (the lock icon) means the connection is secure, but NOT that the site is honest.'
        ],
        type: 'check'
      },
      {
        id: 'file-check',
        title: 'Check the File Extension',
        description: 'After clicking download, look at the file name. Does it end in .exe, .msi, or .dmg?',
        whyItMatters: [
          'If you are downloading a document but get an .exe, it is likely a virus.',
          'Watch out for double extensions like "document.pdf.exe".'
        ],
        type: 'check'
      }
    ]
  },
  {
    id: 'check-file',
    title: 'Check if a File is Safe',
    description: 'Analyze a suspicious file before you open it.',
    icon: ShieldCheck,
    steps: [
      {
        id: 'origin',
        title: 'Where did it come from?',
        description: 'Did you request this file, or did it appear unexpectedly?',
        whyItMatters: [
          'Unsolicited attachments in emails are a top vector for malware.',
          'Files from "friends" on social media might be from hacked accounts.'
        ],
        type: 'check'
      }
    ]
  },
  {
    id: 'vpn',
    title: 'Set Up or Check VPN',
    description: 'Ensure your connection is private and secure.',
    icon: Globe,
    steps: [
      {
        id: 'need',
        title: 'Do you need a VPN?',
        description: 'Are you on public Wi-Fi (cafe, airport) or trying to access region-locked content?',
        whyItMatters: [
          'Home Wi-Fi is usually encrypted already.',
          'Free VPNs often sell your data to pay for servers.'
        ],
        type: 'info'
      }
    ]
  },
  {
    id: 'privacy',
    title: 'Adjust Privacy Settings',
    description: 'Lock down your Windows or browser privacy settings.',
    icon: Settings,
    steps: [
      {
        id: 'scope',
        title: 'What do you want to secure?',
        description: 'Are we looking at Windows settings, Chrome/Edge browser, or a social media account?',
        whyItMatters: [
          'Each system has different "switches" to flip.',
          'Browser privacy stops tracking; OS privacy stops data collection.'
        ],
        type: 'action'
      }
    ]
  },
  {
    id: 'script',
    title: 'Run a Script/Tool Safely',
    description: 'Expert guidance for running command-line tools or scripts.',
    icon: Terminal,
    steps: [
      {
        id: 'source-code',
        title: 'Source Audit',
        description: 'Is this from a GitHub repository? Does it have stars and recent activity?',
        whyItMatters: [
          'Open source does not mean safe.',
          'New accounts with 0 stars are high risk.'
        ],
        type: 'check'
      }
    ]
  },
  {
    id: 'custom',
    title: 'Other / Custom Task',
    description: 'General safety principles for any technical task.',
    icon: HelpCircle,
    steps: [
      {
        id: 'define',
        title: 'Define the Goal',
        description: 'What exactly are you trying to achieve?',
        whyItMatters: [
          'Clarity prevents "xy problems" where you try to solve the wrong issue.',
          'Panic leads to mistakes.'
        ],
        type: 'input'
      }
    ]
  }
];
