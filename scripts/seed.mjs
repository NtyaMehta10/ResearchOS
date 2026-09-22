import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with realistic research data...');

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Clear existing data in reverse dependency order
  await prisma.activity.deleteMany({});
  await prisma.documentTag.deleteMany({});
  await prisma.noteTag.deleteMany({});
  await prisma.projectTag.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Demo Users
  const user = await prisma.user.create({
    data: {
      email: 'demo@researchos.io',
      name: 'Dr. Sarah Lin',
      passwordHash,
      institution: 'Stanford Bio-X Institute',
      department: 'Structural Biology & Biophysics',
      role: 'PRINCIPAL_INVESTIGATOR',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    },
  });

  const colleague = await prisma.user.create({
    data: {
      email: 'dr.elena@researchos.io',
      name: 'Dr. Elena Rostova',
      passwordHash,
      institution: 'MIT Center for Quantum Computing',
      department: 'Applied Physics',
      role: 'SENIOR_RESEARCHER',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    },
  });

  console.log(`Created users: ${user.email}, ${colleague.email}`);

  // 2. Create Tags
  const tagNames = [
    { name: 'CRISPR-Cas9', color: '#10b981' },
    { name: 'Quantum Error Correction', color: '#6366f1' },
    { name: 'Drug Discovery', color: '#ec4899' },
    { name: 'Machine Learning', color: '#8b5cf6' },
    { name: 'Peer-Reviewed', color: '#3b82f6' },
    { name: 'High-Priority', color: '#ef4444' },
    { name: 'Literature Review', color: '#f59e0b' },
    { name: 'Preprint', color: '#06b6d4' },
  ];

  const tags = {};
  for (const t of tagNames) {
    tags[t.name] = await prisma.tag.create({
      data: {
        userId: user.id,
        name: t.name,
        color: t.color,
      },
    });
  }

  // 3. Create Projects
  const project1 = await prisma.project.create({
    data: {
      userId: user.id,
      title: 'Mechanisms of CRISPR-Cas9 Target Recognition & Off-Target Profiling',
      description: 'Systematic biophysical and structural investigation into off-target cleavage mechanisms and engineered Cas9 high-fidelity variants.',
      color: '#10b981',
      icon: 'Dna',
      status: 'ACTIVE',
      visibility: 'SHARED',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      userId: user.id,
      title: 'Fault-Tolerant Surface Codes for Neutral-Atom Quantum Processors',
      description: 'Benchmarking topological threshold simulations, optical tweezer routing architectures, and syndromic decoding latency.',
      color: '#6366f1',
      icon: 'Atom',
      status: 'ACTIVE',
      visibility: 'PRIVATE',
    },
  });

  const project3 = await prisma.project.create({
    data: {
      userId: user.id,
      title: 'Deep Generative Diffusion Models for Macrocyclic Ligand Design',
      description: 'Structure-based geometric deep learning pipeline for targeting historically undruggable protein-protein interfaces in oncology.',
      color: '#ec4899',
      icon: 'Layers',
      status: 'ACTIVE',
      visibility: 'PRIVATE',
    },
  });

  const project4 = await prisma.project.create({
    data: {
      userId: user.id,
      title: 'Global Carbon Capture Sorbent Materials Review 2024-2026',
      description: 'Comprehensive meta-analysis of metal-organic frameworks (MOFs) and amine-functionalized silicas under direct air capture humidity conditions.',
      color: '#f59e0b',
      icon: 'BookOpen',
      status: 'ARCHIVED',
      visibility: 'PUBLIC',
    },
  });

  // Project tags
  await prisma.projectTag.createMany({
    data: [
      { projectId: project1.id, tagId: tags['CRISPR-Cas9'].id },
      { projectId: project1.id, tagId: tags['High-Priority'].id },
      { projectId: project2.id, tagId: tags['Quantum Error Correction'].id },
      { projectId: project2.id, tagId: tags['High-Priority'].id },
      { projectId: project3.id, tagId: tags['Drug Discovery'].id },
      { projectId: project3.id, tagId: tags['Machine Learning'].id },
      { projectId: project4.id, tagId: tags['Literature Review'].id },
    ],
  });

  // 4. Create Collections
  const col1 = await prisma.collection.create({
    data: {
      userId: user.id,
      projectId: project1.id,
      name: 'Foundational Cas9 Papers',
      description: 'Pioneering structural papers, cryo-EM models, and crystal structures.',
      color: '#10b981',
    },
  });

  const col2 = await prisma.collection.create({
    data: {
      userId: user.id,
      projectId: project1.id,
      name: 'High-Fidelity Variant Benchmarks',
      description: 'SpCas9-HF1, eSpCas9, and Cas9-NG specificity assay comparisons.',
      color: '#06b6d4',
    },
  });

  const col3 = await prisma.collection.create({
    data: {
      userId: user.id,
      projectId: project2.id,
      name: 'Neutral Atom Architecture Preprints',
      description: 'Tweezer array reconfiguration, Rydberg interactions, and gate fidelity records.',
      color: '#6366f1',
    },
  });

  const col4 = await prisma.collection.create({
    data: {
      userId: user.id,
      projectId: project3.id,
      name: 'Geometric DL & Equivariant Networks',
      description: 'SE(3)-equivariant score matching architectures and benchmark datasets.',
      color: '#ec4899',
    },
  });

  // 5. Create Documents
  // Create mock files
  const samplePdfPath = path.join(uploadsDir, 'jinek-2012-cas9.pdf');
  fs.writeFileSync(samplePdfPath, '%PDF-1.4 Mock research paper file content for ResearchOS testing');
  
  const doc1 = await prisma.document.create({
    data: {
      userId: user.id,
      projectId: project1.id,
      collectionId: col1.id,
      title: 'A Programmable Dual-RNA-Guided DNA Endonuclease in Adaptive Bacterial Immunity',
      fileName: 'jinek-2012-cas9.pdf',
      fileSize: 2489120,
      mimeType: 'application/pdf',
      filePath: '/uploads/jinek-2012-cas9.pdf',
      authors: 'Martin Jinek, Krzysztof Chylinski, Ines Fonfara, Jennifer Doudna, Emmanuelle Charpentier',
      journal: 'Science',
      publicationYear: 2012,
      doi: '10.1126/science.1225829',
      abstract: 'Clustered regularly interspaced short palindromic repeats (CRISPR)/CRISPR-associated (Cas) systems provide adaptive immunity against viruses and plasmids in bacteria. We show here that Cas9 endonuclease can be programmed with single guide RNAs to target and cleave specific double-stranded DNA sequences.',
      summary: null, // Ready for Phase 2 AI summary
      embeddingStatus: 'NONE',
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      userId: user.id,
      projectId: project1.id,
      collectionId: col2.id,
      title: 'Rationally Engineered Cas9 Nucleases with High Genome-Wide Specificity',
      fileName: 'kleinstiver-2016-spcas9hf1.pdf',
      fileSize: 3120400,
      mimeType: 'application/pdf',
      filePath: '/uploads/kleinstiver-2016-spcas9hf1.pdf',
      authors: 'Benjamin P. Kleinstiver, Michelle S. Pattanayak, Shengdar Q. Tsai, J. Keith Joung',
      journal: 'Nature',
      publicationYear: 2016,
      doi: '10.1038/nature16526',
      abstract: 'Engineered SpCas9-HF1 variant exhibits genome-wide off-target cleavage below detection limits for targeted sites while maintaining robust on-target cleavage activity comparable to wild-type enzyme.',
      summary: null,
      embeddingStatus: 'NONE',
    },
  });

  const doc3 = await prisma.document.create({
    data: {
      userId: user.id,
      projectId: project2.id,
      collectionId: col3.id,
      title: 'Quantum Error Mitigation and Fault-Tolerant Logical Qubits in 2D Rydberg Arrays',
      fileName: 'bluvstein-2023-rydberg-qubits.pdf',
      fileSize: 4210900,
      mimeType: 'application/pdf',
      filePath: '/uploads/bluvstein-2023-rydberg-qubits.pdf',
      authors: 'Dolev Bluvstein, Simon J. Evered, Alexandra A. Geim, Mikhail D. Lukin',
      journal: 'Nature',
      publicationYear: 2023,
      doi: '10.1038/s41586-023-06927-3',
      abstract: 'Realization of transversal entangling gates between 48 logical qubits using dynamically reconfigurable arrays of neutral atoms trapped in optical tweezers.',
      summary: null,
      embeddingStatus: 'NONE',
    },
  });

  const doc4 = await prisma.document.create({
    data: {
      userId: user.id,
      projectId: project3.id,
      collectionId: col4.id,
      title: 'Equivariant 3D Conditional Diffusion for Target-Aware Molecular Generation',
      fileName: 'schneuing-2023-targetdiff.pdf',
      fileSize: 1890200,
      mimeType: 'application/pdf',
      filePath: '/uploads/schneuing-2023-targetdiff.pdf',
      authors: 'Arne Schneuing, Yuanqi Du, Charlotte Harris, Tommi Jaakkola',
      journal: 'ICLR',
      publicationYear: 2023,
      doi: '10.48550/arXiv.2303.03543',
      abstract: 'A continuous SE(3)-equivariant diffusion model that treats ligand atom coordinates and atom types jointly, conditioned on rigid receptor binding pockets.',
      summary: null,
      embeddingStatus: 'NONE',
    },
  });

  // Document tags
  await prisma.documentTag.createMany({
    data: [
      { documentId: doc1.id, tagId: tags['CRISPR-Cas9'].id },
      { documentId: doc1.id, tagId: tags['Peer-Reviewed'].id },
      { documentId: doc2.id, tagId: tags['CRISPR-Cas9'].id },
      { documentId: doc2.id, tagId: tags['High-Priority'].id },
      { documentId: doc3.id, tagId: tags['Quantum Error Correction'].id },
      { documentId: doc3.id, tagId: tags['Peer-Reviewed'].id },
      { documentId: doc4.id, tagId: tags['Drug Discovery'].id },
      { documentId: doc4.id, tagId: tags['Machine Learning'].id },
    ],
  });

  // 6. Create Notes
  const note1 = await prisma.note.create({
    data: {
      userId: user.id,
      projectId: project1.id,
      documentId: doc1.id,
      title: 'Structural Basis of the PAM Proximal Seed Region',
      content: `### Overview & Kinetic Insights
The 8–10 bp seed region adjacent to the Protospacer Adjacent Motif (PAM: \`5'-NGG-3'\`) dictates initial R-loop formation. 

Key observations from our kinetics review:
* Mismatches within positions 1–8 downstream of the PAM abrogate target cleavage by >95%.
* In contrast, distal mismatches (positions 14–20) permit stable binding with attenuated catalytic turnover.
* Cryo-EM models reveal that the **REC lobe** undergoes a ~30° rotation only upon continuous base pairing through the entire 20 nt protospacer.

\`\`\`typescript
// Hypothetical off-target risk calculator score
interface CleavageKineticParam {
  pamProximityIndex: number; // 0 (distal) to 1 (seed)
  gcContentFraction: number;
  rLoopFreeEnergyDelta: number; // kcal/mol
}
\`\`\`

#### Next Steps for Lab Meeting:
1. Synthesize modified crRNAs with locked nucleic acids (LNAs) at positions 4 and 7.
2. Run differential scanning fluorimetry (DSF) with apo-Cas9 vs. Cas9-sgRNA ribonucleoprotein complex.`,
      isPinned: true,
    },
  });

  const note2 = await prisma.note.create({
    data: {
      userId: user.id,
      projectId: project1.id,
      documentId: doc2.id,
      title: 'Comparison: Wildtype vs. SpCas9-HF1 Residue Contacts',
      content: `### Engineered Mutations in SpCas9-HF1
Kleinstiver et al. identified four non-specific contacts with the target DNA backbone that, when mutated to alanine, decrease energetic excess without sacrificing on-target cleavage:

* **N497A** (REC3 domain)
* **R661A** (REC3 domain)
* **Q695A** (REC3 domain)
* **Q926A** (HNH domain)

> "By weakening non-specific contact energy, the enzyme requires precise Watson-Crick pairing to overcome the activation barrier for HNH and RuvC domain positioning."

**Conclusion**: Excellent candidate for our viral delivery vector constructs.`,
      isPinned: false,
    },
  });

  const note3 = await prisma.note.create({
    data: {
      userId: user.id,
      projectId: project2.id,
      documentId: doc3.id,
      title: 'Surface Code Thresholds on Tweezer Platforms',
      content: `### Decoding Speed vs. Physical Tweezer Transit Time
A key bottleneck in physical tweezer shuttling:
- Atom movement speed: ~0.55 µm/µs
- Minimum separation to prevent crosstalk: ~4.0 µm
- Shuttling duration per syndrome extraction round: **~120 µs**

Compare with superconducting qubits (<1 µs), but neutral atoms benefit from **all-to-all connectivity via mobile shuttles**!`,
      isPinned: true,
    },
  });

  const note4 = await prisma.note.create({
    data: {
      userId: user.id,
      projectId: project3.id,
      documentId: doc4.id,
      title: 'TargetDiff Training Run Hyperparameters & PDB Selection',
      content: `Filtered PDBBind 2020 refined set for proteins with resolution < 2.5 Å.
- Batch size: 64
- Learning rate: 1e-4 with cosine decay
- Rotation equivariant vector layers: 6
- Ligand pocket cutoff: 10.0 Å from any ligand heavy atom.`,
      isPinned: false,
    },
  });

  // Note tags
  await prisma.noteTag.createMany({
    data: [
      { noteId: note1.id, tagId: tags['CRISPR-Cas9'].id },
      { noteId: note1.id, tagId: tags['High-Priority'].id },
      { noteId: note2.id, tagId: tags['CRISPR-Cas9'].id },
      { noteId: note3.id, tagId: tags['Quantum Error Correction'].id },
      { noteId: note4.id, tagId: tags['Machine Learning'].id },
    ],
  });

  // 7. Create Activities (Chronological timeline)
  const now = new Date();
  const minutesAgo = (m) => new Date(now.getTime() - m * 60 * 1000);
  const hoursAgo = (h) => new Date(now.getTime() - h * 3600 * 1000);
  const daysAgo = (d) => new Date(now.getTime() - d * 86400 * 1000);

  const activities = [
    {
      userId: user.id,
      projectId: project1.id,
      action: 'PROJECT_CREATED',
      entityType: 'PROJECT',
      entityId: project1.id,
      entityTitle: project1.title,
      details: 'Initialized project workspace for CRISPR off-target profiling',
      createdAt: daysAgo(5),
    },
    {
      userId: user.id,
      projectId: project1.id,
      action: 'COLLECTION_CREATED',
      entityType: 'COLLECTION',
      entityId: col1.id,
      entityTitle: col1.name,
      details: 'Created collection for foundational literature',
      createdAt: daysAgo(4),
    },
    {
      userId: user.id,
      projectId: project1.id,
      action: 'DOC_UPLOADED',
      entityType: 'DOCUMENT',
      entityId: doc1.id,
      entityTitle: doc1.title,
      details: 'Uploaded original Jinek et al. Science landmark paper (2.4 MB)',
      createdAt: daysAgo(4),
    },
    {
      userId: user.id,
      projectId: project1.id,
      action: 'NOTE_CREATED',
      entityType: 'NOTE',
      entityId: note1.id,
      entityTitle: note1.title,
      details: 'Synthesized kinetic observations on PAM proximal seed pairing',
      createdAt: daysAgo(3),
    },
    {
      userId: user.id,
      projectId: project2.id,
      action: 'PROJECT_CREATED',
      entityType: 'PROJECT',
      entityId: project2.id,
      entityTitle: project2.title,
      details: 'Created quantum error correction modeling workspace',
      createdAt: daysAgo(2),
    },
    {
      userId: user.id,
      projectId: project2.id,
      action: 'DOC_UPLOADED',
      entityType: 'DOCUMENT',
      entityId: doc3.id,
      entityTitle: doc3.title,
      details: 'Added Harvard/MIT Lukin group 48-logical qubit landmark manuscript',
      createdAt: daysAgo(2),
    },
    {
      userId: user.id,
      projectId: project2.id,
      action: 'NOTE_CREATED',
      entityType: 'NOTE',
      entityId: note3.id,
      entityTitle: note3.title,
      details: 'Calculated tweezer shuttling overhead vs decoding latency',
      createdAt: hoursAgo(6),
    },
    {
      userId: user.id,
      projectId: project1.id,
      action: 'DOC_UPLOADED',
      entityType: 'DOCUMENT',
      entityId: doc2.id,
      entityTitle: doc2.title,
      details: 'Added Kleinstiver et al. SpCas9-HF1 reference paper',
      createdAt: hoursAgo(3),
    },
    {
      userId: user.id,
      projectId: project1.id,
      action: 'NOTE_CREATED',
      entityType: 'NOTE',
      entityId: note2.id,
      entityTitle: note2.title,
      details: 'Documented structural mutation positions (N497A, R661A, Q695A, Q926A)',
      createdAt: minutesAgo(45),
    },
  ];

  for (const act of activities) {
    await prisma.activity.create({ data: act });
  }

  console.log(`Seeding finished successfully!`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
