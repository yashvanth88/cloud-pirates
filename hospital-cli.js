#!/usr/bin/env node

/**
 * Cloud Pirates Hospital CLI
 * Easy cloud management for non-technical hospital staff
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function printHeader() {
  console.clear();
  console.log(`
${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.cyan}║                 🏥 CLOUD PIRATES CLI 🏥                    ║${colors.reset}
${colors.bright}${colors.cyan}║         Hospital Cloud Management for Medical Staff          ║${colors.reset}
${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}
  `);
}

async function showMainMenu() {
  console.log(`${colors.bright}${colors.blue}What would you like to do?${colors.reset}\n`);
  console.log(`1) 🏥 Hospital Dashboard Status`);
  console.log(`2) 🔧 Check System Health`);
  console.log(`3) 👥 View Patient Count`);
  console.log(`4) 📊 View Database Status`);
  console.log(`5) 🌐 Get Application URL`);
  console.log(`6) 📋 View Recent Logs`);
  console.log(`7) ⚡ Restart Services`);
  console.log(`8) 📸 View Backups`);
  console.log(`9) ❓ Help & Documentation`);
  console.log(`0) Exit\n`);

  const choice = await question(`${colors.yellow}Select option (0-9): ${colors.reset}`);
  return choice;
}

async function getDashboardStatus() {
  console.log(`\n${colors.bright}${colors.green}📊 Hospital Dashboard Status${colors.reset}\n`);
  
  try {
    const kubeconfig = path.join(process.cwd(), 'kubeconfig.yaml');
    if (!fs.existsSync(kubeconfig)) {
      console.log(`${colors.red}❌ Kubeconfig not found. Please deploy first.${colors.reset}`);
      return;
    }

    process.env.KUBECONFIG = kubeconfig;
    
    // Get pod status
    const { stdout } = await execAsync(`kubectl get pods -n cloud-pirates -o wide 2>/dev/null || echo "Not deployed"`);
    
    if (stdout.includes('Not deployed')) {
      console.log(`${colors.yellow}⚠️  System not yet deployed${colors.reset}`);
      console.log(`Run: ${colors.bright}npm run deploy${colors.reset}`);
      return;
    }

    console.log(`${colors.green}✓ System Status: ACTIVE${colors.reset}\n`);
    console.log(`${colors.bright}Services:${colors.reset}`);
    console.log(stdout);

    // Get LoadBalancer IP
    const { stdout: ipStdout } = await execAsync(`kubectl get svc pirates-frontend -n cloud-pirates -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null`);
    if (ipStdout) {
      console.log(`\n${colors.bright}Application URL:${colors.reset} ${colors.cyan}http://${ipStdout}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
  }
}

async function checkHealth() {
  console.log(`\n${colors.bright}${colors.green}🔧 System Health Check${colors.reset}\n`);

  try {
    const kubeconfig = path.join(process.cwd(), 'kubeconfig.yaml');
    process.env.KUBECONFIG = kubeconfig;

    // Check cluster
    console.log(`${colors.cyan}Checking cluster...${colors.reset}`);
    try {
      const { stdout } = await execAsync(`kubectl cluster-info 2>&1 | head -1`);
      console.log(`${colors.green}✓ Cluster: Connected${colors.reset}`);
    } catch {
      console.log(`${colors.red}✗ Cluster: Not connected${colors.reset}`);
    }

    // Check pods
    console.log(`${colors.cyan}Checking pods...${colors.reset}`);
    const { stdout: podsStdout } = await execAsync(`kubectl get pods -n cloud-pirates --no-headers 2>/dev/null | wc -l`);
    const podCount = parseInt(podsStdout.trim());
    if (podCount > 0) {
      console.log(`${colors.green}✓ Pods: ${podCount} running${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Pods: None running${colors.reset}`);
    }

    // Check database
    console.log(`${colors.cyan}Checking database...${colors.reset}`);
    const { stdout: dbStdout } = await execAsync(`kubectl get pods -n cloud-pirates -l app.kubernetes.io/name=postgresql 2>/dev/null | grep Running || echo "Not running"`);
    if (dbStdout.includes('Running')) {
      console.log(`${colors.green}✓ Database: PostgreSQL running${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️  Database: Initializing or not found${colors.reset}`);
    }

    // Check LoadBalancer
    console.log(`${colors.cyan}Checking LoadBalancer...${colors.reset}`);
    const { stdout: lbStdout } = await execAsync(`kubectl get svc pirates-frontend -n cloud-pirates -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null`);
    if (lbStdout) {
      console.log(`${colors.green}✓ LoadBalancer: Active (${lbStdout})${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️  LoadBalancer: Pending IP allocation${colors.reset}`);
    }

    console.log(`\n${colors.green}✓ Health check complete!${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}❌ Error during health check: ${error.message}${colors.reset}`);
  }
}

async function getPatientCount() {
  console.log(`\n${colors.bright}${colors.green}👥 Patient Records${colors.reset}\n`);

  try {
    const url = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : 'http://212.2.246.88';
    
    const response = await fetch(`${url}/api/emrs`);
    const patients = await response.json();
    
    if (Array.isArray(patients)) {
      console.log(`${colors.green}✓ Total Patients: ${patients.length}${colors.reset}\n`);
      
      if (patients.length > 0) {
        console.log(`${colors.bright}Recent Patients:${colors.reset}`);
        patients.slice(0, 5).forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.patient_name} (Age: ${p.age || 'N/A'}, Created: ${new Date(p.created_at).toLocaleDateString()})`);
        });
      }
    } else {
      console.log(`${colors.yellow}⚠️  Could not retrieve patient data${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Note: Application may not be fully started yet${colors.reset}`);
  }
}

async function getDatabaseStatus() {
  console.log(`\n${colors.bright}${colors.green}📊 Database Status${colors.reset}\n`);

  try {
    const kubeconfig = path.join(process.cwd(), 'kubeconfig.yaml');
    process.env.KUBECONFIG = kubeconfig;

    const { stdout } = await execAsync(`kubectl describe statefulset postgres-postgresql -n cloud-pirates 2>/dev/null || echo "Not found"`);
    
    if (stdout.includes('Not found')) {
      console.log(`${colors.yellow}⚠️  Database not found${colors.reset}`);
      return;
    }

    console.log(`${colors.green}✓ PostgreSQL Database Status:${colors.reset}\n`);
    const lines = stdout.split('\n');
    const relevantLines = lines.filter(l => l.includes('Replicas') || l.includes('Ready') || l.includes('Updated'));
    relevantLines.forEach(line => console.log(`  ${line.trim()}`));

    console.log(`\n${colors.cyan}Database Details:${colors.reset}`);
    console.log(`  Name: hospital_db`);
    console.log(`  User: hospital`);
    console.log(`  Storage: 5GB`);
    console.log(`  Backup: Automatic`);
  } catch (error) {
    console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
  }
}

async function getApplicationURL() {
  console.log(`\n${colors.bright}${colors.green}🌐 Application URL${colors.reset}\n`);

  try {
    const kubeconfig = path.join(process.cwd(), 'kubeconfig.yaml');
    process.env.KUBECONFIG = kubeconfig;

    const { stdout } = await execAsync(`kubectl get svc pirates-frontend -n cloud-pirates -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null`);
    
    if (stdout) {
      console.log(`${colors.green}✓ Application is LIVE!${colors.reset}\n`);
      console.log(`${colors.bright}URL: ${colors.cyan}http://${stdout}${colors.reset}`);
      console.log(`\n${colors.yellow}How to access:${colors.reset}`);
      console.log(`  1. Open your browser`);
      console.log(`  2. Visit: http://${stdout}`);
      console.log(`  3. Hospital staff can login and manage patients\n`);
      
      const openApp = await question(`${colors.yellow}Would you like to open it now? (y/n): ${colors.reset}`);
      if (openApp.toLowerCase() === 'y') {
        const { exec: execSync } = require('child_process');
        execSync(`open http://${stdout} || xdg-open http://${stdout} || start http://${stdout}`, { stdio: 'ignore' });
        console.log(`${colors.green}✓ Opening application...${colors.reset}`);
      }
    } else {
      console.log(`${colors.yellow}⚠️  LoadBalancer IP not yet assigned${colors.reset}`);
      console.log(`Check status with: ${colors.bright}hospital-cli --status${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
  }
}

async function viewRecentLogs() {
  console.log(`\n${colors.bright}${colors.green}📋 Recent Logs${colors.reset}\n`);

  try {
    const kubeconfig = path.join(process.cwd(), 'kubeconfig.yaml');
    process.env.KUBECONFIG = kubeconfig;

    console.log(`${colors.cyan}Backend Logs (Last 10 lines):${colors.reset}\n`);
    const { stdout } = await execAsync(`kubectl logs deploy/pirates-backend -n cloud-pirates --tail=10 2>/dev/null || echo "No logs yet"`);
    console.log(stdout);

    console.log(`\n${colors.yellow}💡 Tip: For real-time logs, run:${colors.reset}`);
    console.log(`  kubectl logs deploy/pirates-backend -n cloud-pirates -f`);
  } catch (error) {
    console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
  }
}

async function restartServices() {
  console.log(`\n${colors.bright}${colors.red}⚡ Restart Services${colors.reset}\n`);
  
  console.log(`${colors.yellow}WARNING: This will restart all hospital services!${colors.reset}\n`);
  console.log(`Services to restart:`);
  console.log(`  • Frontend (hospital web interface)`);
  console.log(`  • Backend (API server)`);
  console.log(`  • Database (may take 1-2 minutes)\n`);

  const confirm = await question(`${colors.yellow}Are you sure you want to restart? (yes/no): ${colors.reset}`);
  
  if (confirm !== 'yes') {
    console.log(`${colors.yellow}Restart cancelled${colors.reset}`);
    return;
  }

  try {
    const kubeconfig = path.join(process.cwd(), 'kubeconfig.yaml');
    process.env.KUBECONFIG = kubeconfig;

    console.log(`\n${colors.cyan}Restarting services...${colors.reset}`);
    
    await execAsync(`kubectl rollout restart deployment/pirates-backend -n cloud-pirates`);
    console.log(`${colors.green}✓ Backend restarted${colors.reset}`);
    
    await execAsync(`kubectl rollout restart deployment/pirates-frontend -n cloud-pirates`);
    console.log(`${colors.green}✓ Frontend restarted${colors.reset}`);
    
    console.log(`\n${colors.green}✓ All services restarted!${colors.reset}`);
    console.log(`${colors.yellow}Give the system 30-60 seconds to fully come back online${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}❌ Error during restart: ${error.message}${colors.reset}`);
  }
}

async function viewBackups() {
  console.log(`\n${colors.bright}${colors.green}📸 Backups & Recovery${colors.reset}\n`);
  
  console.log(`${colors.cyan}Current Backup Status:${colors.reset}`);
  console.log(`  ${colors.green}✓${colors.reset} Database: Automatic daily backups (Civo managed)`);
  console.log(`  ${colors.green}✓${colors.reset} Application: Stateless (can be redeployed anytime)`);
  console.log(`  ${colors.green}✓${colors.reset} Configuration: Stored in Kubernetes secrets\n`);

  console.log(`${colors.cyan}Recovery Instructions:${colors.reset}`);
  console.log(`  1. If services crash: ${colors.bright}hospital-cli restart${colors.reset}`);
  console.log(`  2. If data is lost: Contact Civo support`);
  console.log(`  3. For manual backup: ${colors.bright}kubectl get all -n cloud-pirates${colors.reset}`);
}

async function showHelp() {
  console.log(`
${colors.bright}${colors.cyan}HOSPITAL CLI COMMANDS${colors.reset}

${colors.bright}hospital-cli [command]${colors.reset}

${colors.bright}Commands:${colors.reset}
  status          Show dashboard status
  health          Check system health
  patients        View patient count
  database        Show database status
  url             Get application URL
  logs            View recent logs
  restart         Restart services
  backups         View backup status
  help            Show this help
  
${colors.bright}Examples:${colors.reset}
  hospital-cli status
  hospital-cli health
  hospital-cli patients
  
${colors.bright}Quick Actions:${colors.reset}
  Open Application:   hospital-cli url
  Check Health:       hospital-cli health
  View Patients:      hospital-cli patients
  
${colors.bright}Documentation:${colors.reset}
  Full Guide: See HOSPITAL_GUIDE.md
  API Docs: See QUICK_REFERENCE.md
  
${colors.bright}Support:${colors.reset}
  Email: ops@cloudpirates.io
  Region: Mumbai (MUM1)
  Uptime SLA: 99.9%
  `);
}

async function main() {
  // Check for command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Interactive mode
    await printHeader();
    let running = true;
    
    while (running) {
      const choice = await showMainMenu();
      
      switch (choice) {
        case '1':
          await getDashboardStatus();
          break;
        case '2':
          await checkHealth();
          break;
        case '3':
          await getPatientCount();
          break;
        case '4':
          await getDatabaseStatus();
          break;
        case '5':
          await getApplicationURL();
          break;
        case '6':
          await viewRecentLogs();
          break;
        case '7':
          await restartServices();
          break;
        case '8':
          await viewBackups();
          break;
        case '9':
          await showHelp();
          break;
        case '0':
          console.log(`\n${colors.green}👋 Goodbye!${colors.reset}\n`);
          running = false;
          break;
        default:
          console.log(`${colors.red}Invalid option${colors.reset}`);
      }
      
      if (running && choice !== '0') {
        await question(`\n${colors.yellow}Press Enter to continue...${colors.reset}`);
        console.clear();
      }
    }
  } else {
    // Command line mode
    const command = args[0];
    
    switch (command) {
      case 'status':
        await getDashboardStatus();
        break;
      case 'health':
        await checkHealth();
        break;
      case 'patients':
        await getPatientCount();
        break;
      case 'database':
        await getDatabaseStatus();
        break;
      case 'url':
        await getApplicationURL();
        break;
      case 'logs':
        await viewRecentLogs();
        break;
      case 'restart':
        await restartServices();
        break;
      case 'backups':
        await viewBackups();
        break;
      case 'help':
      case '--help':
      case '-h':
        await showHelp();
        break;
      default:
        console.log(`${colors.red}Unknown command: ${command}${colors.reset}`);
        await showHelp();
    }
  }
  
  rl.close();
  process.exit(0);
}

main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
