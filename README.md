# 🧱 Machine Learning with LEGO® Bricks

An interactive web platform for learning machine learning concepts through hands-on experimentation with LEGO® SPIKE Prime Hub.

[![Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue)](https://learning-and-dynamics.github.io/ml-with-bricks/)
[![Course](https://img.shields.io/badge/YouTube-Video%20Course-red)](https://www.youtube.com/watch?v=yPgb-fCM7vc&list=PLx1grFu4zAcwfKKJZ1Ux4LwRqaePCOA2J&index=1)
[![Paper](https://img.shields.io/badge/arXiv-Paper-violet)](https://arxiv.org/abs/2601.19376)

## 📰 Updates

**January 27, 2025** — 📄 Our research paper has been submitted to arXiv! Read about the pedagogical foundations and implementation details [here](https://arxiv.org/abs/2601.19376).

## 🔎 Overview

Transform abstract machine learning concepts into tangible, hands-on learning experiences. This platform bridges theory and practice by connecting LEGO® SPIKE Prime Hub to your browser via Bluetooth Low Energy (BLE), enabling interactive exploration of core ML algorithms.

### What You'll Learn

- **K-Nearest Neighbors** — Classify fruits based on length and color
- **Linear Regression** — Build a robot that consistently hits its target
- **Q-Learning** — Train a self-learning crawler from scratch

### What You Need

- **LEGO® SPIKE Prime Hub** — The physical robot hardware
- **Compatible Browser** — Chrome or Edge (supports Web BLE API)

### Get Started 
1. **Visit** the [live platform](https://learning-and-dynamics.github.io/ml-with-bricks/)
2. **Connect** your LEGO® SPIKE Prime Hub via Bluetooth
3. **Follow** the tutorials or our [video course](https://www.youtube.com/watch?v=yPgb-fCM7vc&list=PLx1grFu4zAcwfKKJZ1Ux4LwRqaePCOA2J&index=1) to learn ML concepts hands-on

No installation required — everything runs in your browser!


## 💻 For developers

Want to contribute or run the platform locally?

**Prerequisites:**
- Node.js v16 or higher
- LEGO® SPIKE Prime Hub
- Chrome or Edge browser

**Installation:**
```bash
# Clone the repository
git clone https://github.com/learning-and-dynamics/ml-with-bricks.git

# Navigate to project directory
cd ml-with-bricks

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

**Tech Stack:** React, Vite, TypeScript, Web BLE API

**Building your own integration?** Check out our [SPIKE Prime BLE boilerplate](https://github.com/slavasg-lab/lego-spikeprime-ble-boilerplate) for a clean starting template.


## 👥 Project Team

This project is created by joint effort of:
- **Viacheslav Sydora ([GitHub](https://github.com/slavasg-lab), [LinkedIn](https://www.linkedin.com/in/viacheslav-sydora/))**
- **Guner Dilsad Er ([LinkedIn](https://www.linkedin.com/in/guner-dilsad-er/))**
- **Michael Muehlebach ([Website](https://sites.google.com/view/mmuehlebach/))**

## 🙏 Acknowledgments

We gratefully acknowledge:
- **[Yufeng (Eric) Wu](https://www.yufengwu.com/)** for guidance on Bluetooth communication during early development
- **[Tufts Center for Engineering Education and Outreach (CEEO)](https://ceeo.tufts.edu/)** for pedagogical and Fruit Detector design inspiration
- **Prof. Val Rousseau** for Crawler inspiration ([video reference](https://www.youtube.com/watch?v=F-kNXAFeffs))
- **Rebecca Shen** for Pitcher design inspiration
- **LEGO Education** for BLE Python examples: [spike-prime-docs](https://github.com/LEGO/spike-prime-docs/tree/main/examples/python)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## ⚖️ Disclaimer

LEGO® and SPIKE™ are registered trademarks of the LEGO Group, which does not sponsor, authorize or endorse this software.

---

<div align="center">

**[🚀 Try the Platform](https://learning-and-dynamics.github.io/ml-with-bricks/)** | **[📺 Watch Course](https://www.youtube.com/watch?v=yPgb-fCM7vc&list=PLx1grFu4zAcwfKKJZ1Ux4LwRqaePCOA2J&index=1)** | **[📄 Read Paper](https://arxiv.org/abs/2601.19376)** | **[⭐ Star this Repo](https://github.com/learning-and-dynamics/ml-with-bricks)**

</div>