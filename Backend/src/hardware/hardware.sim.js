const logger = require('../config/logger');

class HardwareSim {
  static async executeStageHardwareTest(stageId, meterNo) {
    logger.info(`Simulating Hardware Execution for Stage ${stageId} on Meter ${meterNo}`);
    await new Promise(resolve => setTimeout(resolve, 800));

    switch (Number(stageId)) {
      case 1:
        return {
          firmware_version: 'v3.14.2-ZM',
          flash_size_kb: 512,
          checksum: '0x4F8A99B2',
          flash_time_ms: 1240,
          status: 'PASS',
          log: '[HARDWARE] JIG-01 connected. Flashing MCU firmware... Memory verified 100%. Checksum MATCH.'
        };
      case 2:
        return {
          nic_serial: `NIC-${meterNo.replace('MTR', '')}`,
          signal_strength_dbm: -64,
          mac_address: '00:1A:2B:3C:4D:5E',
          packets_sent: 100,
          packets_received: 100,
          packet_loss_pct: 0,
          status: 'PASS',
          log: '[HARDWARE] RF Jig active. NIC carrier frequency 868MHz online. PING 100/100 received.'
        };
      case 3:
        return {
          assembly_checkpoint: 'NIC_BOX_SECURED',
          torque_nm: 0.45,
          operator_confirmation: true,
          status: 'PASS',
          log: '[MANUAL CHECKPOINT] NIC PCB housing clipped and screw torque verified (0.45Nm).'
        };
      case 4:
        const SerialManager = require('./serial/serialManager');
        const serialStatus = SerialManager.getStatus();
        return {
          connected: serialStatus.connected,
          port: serialStatus.port,
          status: serialStatus.connected ? 'PASS' : 'HOLD',
          log: serialStatus.connected
            ? `[JIG HARDWARE] Physical USB Serial Jig active on port ${serialStatus.port}. Real hardware telemetries processed strictly via USB CDC.`
            : '[JIG HARDWARE] No physical USB Jig connected. Connect USB hardware to execute live test.'
        };
      case 5:
        return {
          assembly_checkpoint: 'MAIN_PCB_BOX_ASSEMBLED',
          terminal_block_secured: true,
          status: 'PASS',
          log: '[MANUAL CHECKPOINT] Main Meter PCB fitted into IP54 casing. Seals aligned.'
        };
      case 6:
        return {
          applied_voltage_v: 230.15,
          measured_current_a: 5.002,
          active_power_w: 1150.8,
          pf: 1.00,
          accuracy_error_pct: 0.08,
          limit_max_error_pct: 0.20,
          status: 'PASS',
          log: '[CALIBRATION JIG] Reference source 230V 5A injected. Meter pulse constant 1600 imp/kWh calibrated. Error: +0.08% (Class 0.5S PASS).'
        };
      case 7:
        return {
          laser_job_id: `LSR-${meterNo}`,
          laser_power_watt: 20,
          print_verification: 'OK',
          status: 'PASS',
          log: '[LASER ENGRAVER] Marking Utility Logo, Serial SN-2026-XXXX and Barcode on Front Cover.'
        };
      case 8:
        return {
          relay_latch_test: 'PASSED',
          rtc_drift_ppm: 0.12,
          display_lcd_test: 'ALL_SEGMENTS_OK',
          tamper_switch_test: 'TRIGGER_VERIFIED',
          optical_port_baud: 9600,
          status: 'PASS',
          log: '[FUNCTIONAL JIG] Relay disconnected & re-engaged cleanly. RTC synced. Optical DLMS query OK.'
        };
      case 9:
        return {
          pvc_seal_tag_id: `SEAL-${Date.now().toString().slice(-6)}`,
          ultrasonic_weld_status: 'WELDED',
          status: 'PASS',
          log: '[SECURITY] Ultrasonic tamper-proof PVC seal tag locked and scanned.'
        };
      case 10:
        return {
          box_weight_grams: 485,
          weight_spec_grams: '480-490',
          box_barcode: `BOX-${meterNo}`,
          status: 'PASS',
          log: '[PACKAGING] Box weight 485g within limits. Barcode label printed and applied to individual carton.'
        };
      case 11:
        return {
          master_carton_id: `MST-${Date.now().toString().slice(-6)}`,
          meters_in_master: 10,
          total_gross_kg: 5.12,
          pallet_tag: 'PALLET-A12',
          status: 'PASS',
          log: '[MASTER PACKAGING] Meter aggregated into Master Box. Shipping pallet manifest generated.'
        };
      default:
        return { status: 'PASS', log: 'Generic hardware test passed' };
    }
  }
}

module.exports = HardwareSim;
