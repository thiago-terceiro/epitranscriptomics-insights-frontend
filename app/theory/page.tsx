"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type OutlineItem = {
  id: string;
  title: string;
};

type Section = OutlineItem & {
  content: ReactNode;
  subsections?: OutlineItem[];
};

type CollapsibleSectionProps = Section & {
  isOpen: boolean;
  onToggle: () => void;
};

const CollapsibleSection = ({
  id,
  title,
  content,
  isOpen,
  onToggle,
}: CollapsibleSectionProps) => {
  return (
    <section
      id={id}
      className="border-border dark:bg-card rounded-3xl border bg-white px-6 py-6 shadow-sm transition-colors sm:px-8 sm:py-8"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
      >
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <ChevronDown
          className={cn(
            "text-muted-foreground h-6 w-6 shrink-0 transition-transform duration-200",
            isOpen ? "rotate-0" : "-rotate-90"
          )}
          aria-hidden="true"
        />
      </button>

      <div
        id={`${id}-content`}
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
        aria-hidden={!isOpen}
      >
        <div className="text-muted-foreground min-h-0 overflow-hidden pt-6 text-base sm:text-lg">
          {content}
        </div>
      </div>
    </section>
  );
};

const TheoryPage = () => {
  const sections = useMemo<Section[]>(
    () => [
      {
        id: "epitranscriptomics-foundations",
        title: "Epitranscriptomics foundations",
        subsections: [
          { id: "epitranscriptomics-foundations-overview", title: "Overview" },
          {
            id: "epitranscriptomics-foundations-name-breakdown",
            title: "Name Breakdown",
          },
          {
            id: "epitranscriptomics-foundations-difference",
            title: "How is it different?",
          },
          {
            id: "epitranscriptomics-foundations-why-it-matters",
            title: "Why it matters",
          },
          { id: "epitranscriptomics-foundations-analogy", title: "Analogy" },
        ],
        content: (
          <div className="space-y-8 leading-relaxed">
            <section
              className="space-y-3"
              id="epitranscriptomics-foundations-overview"
            >
              <h2 className="text-foreground text-xl font-semibold">
                Overview
              </h2>
              <p>
                Imagine your body is like a big company. Your DNA is the
                instruction manual, and RNA is the message that guides each
                worker (your cells). As in any company, messages are
                prioritised, delayed, or annotated before they reach the floor.
                Those annotations are the realm of epitranscriptomics: chemical
                marks that alter how RNA behaves without modifying the original
                DNA blueprint.
              </p>
            </section>

            <section
              className="space-y-3"
              id="epitranscriptomics-foundations-name-breakdown"
            >
              <h2 className="text-foreground text-xl font-semibold">
                Name Breakdown
              </h2>
              <p>
                Breaking Down the Word “epi - transcript - omics”
                <ul className="text-muted-foreground list-disc space-y-2 pl-5">
                  <li>
                    1. epi-
                    <ul className="text-muted-foreground list-disc space-y-2 pl-5">
                      <li> From Greek, meaning “on top of” or “above”.</li>
                      <li>
                        In biology, it usually refers to changes on top of the
                        genetic material, without changing the actual DNA or RNA
                        sequence.
                      </li>
                      <li>
                        Think of it like adding sticky notes or highlights to a
                        book — the original text stays the same, but the meaning
                        or use can change.
                      </li>
                    </ul>
                  </li>
                  <li>
                    2. transcript-
                    <ul className="text-muted-foreground list-disc space-y-2 pl-5">
                      <li>
                        Refers to RNA, which is a copy or “transcript” made from
                        DNA.
                      </li>
                      <li>
                        When your body needs to make proteins, it transcribes
                        (copies) instructions from DNA into RNA.
                      </li>
                      <li>
                        So “transcript” here = messenger RNA (mRNA) — the
                        message that tells your cells what to do.
                      </li>
                    </ul>
                  </li>
                  <li>
                    3. -omics: A science word meaning “the study of all of”
                    something in a system. Like:
                    <ul className="text-muted-foreground list-disc space-y-2 pl-5">
                      <li>Gen | omics = study of all genes</li>
                      <li>Prote | omics = study of all proteins</li>
                      <li>
                        Epitranscript | omics = study of all RNA modifications
                      </li>
                    </ul>
                  </li>
                </ul>
              </p>
            </section>

            <section
              className="bg-muted/40 text-muted-foreground space-y-3 rounded-2xl p-5 text-sm sm:text-base"
              id="epitranscriptomics-foundations-difference"
            >
              <h2 className="text-foreground text-lg font-semibold">
                How is it different?
              </h2>
              <p>
                Epigenetics reshapes how DNA is packaged and accessed.
                Epitranscriptomics edits the message after it is written,
                influencing whether, when, and how strongly a transcript is
                used.
              </p>
            </section>

            <section
              className="space-y-4"
              id="epitranscriptomics-foundations-why-it-matters"
            >
              <h2 className="text-foreground text-xl font-semibold">
                Why it matters
              </h2>
              <ul className="text-muted-foreground list-disc space-y-2 pl-5">
                <li>Shapes which proteins are produced and when.</li>
                <li>Tunes how quickly cells respond to stimuli.</li>
                <li>
                  Reveals mechanisms behind disorders from cancer to
                  neurodegeneration.
                </li>
              </ul>
              <p className="text-muted-foreground">
                Decoding these signals promises more precise diagnostics and
                therapeutics that operate on RNA regulation rather than DNA
                editing.
              </p>
            </section>

            <section
              className="space-y-3"
              id="epitranscriptomics-foundations-analogy"
            >
              <h2 className="text-foreground text-xl font-semibold">Analogy</h2>
              <p className="text-muted-foreground">
                Picture DNA as a cookbook and RNA as a photocopy of a single
                recipe. Epitranscriptomic marks are sticky notes on that copy:
                "Serve this first", "Skip for now", or "Add a secret
                ingredient". The original stays intact, yet execution changes
                dramatically.
              </p>
            </section>
          </div>
        ),
      },
      {
        id: "rna-modifications-matter",
        title: "Why RNA modifications matter for functional genomics",
        subsections: [
          {
            id: "rna-modifications-matter-canonical-marks",
            title: "Canonical marks",
          },
          {
            id: "rna-modifications-matter-writer-eraser",
            title: "Writer and eraser enzymes",
          },
          {
            id: "rna-modifications-matter-nanopore",
            title: "Nanopore signal signatures",
          },
          {
            id: "rna-modifications-matter-interpretation",
            title: "Biological interpretation",
          },
        ],
        content: (
          <div className="space-y-8">
            <p>
              Epitranscriptomics expands the central dogma: RNA marks fine-tune
              translation, stability, and the tempo of cellular responses.
              Modern sequencing reveals these reversible edits in real time,
              connecting molecular nuance with phenotype.
            </p>

            <article className="border-border dark:bg-background space-y-8 rounded-3xl border bg-white p-6 sm:p-10">
              <section
                className="space-y-3"
                id="rna-modifications-matter-canonical-marks"
              >
                <h2 className="text-foreground text-xl font-semibold">
                  Canonical marks
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  N6-methyladenosine (m6A), 5-methylcytidine (m5C), and
                  pseudouridine (Ψ) dominate eukaryotic transcriptomes. They
                  regulate export, translation initiation, and decay by
                  recruiting reader proteins and reshaping local RNA structure.
                </p>
              </section>

              <section
                className="space-y-3"
                id="rna-modifications-matter-writer-eraser"
              >
                <h2 className="text-foreground text-xl font-semibold">
                  Writer and eraser enzymes
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  METTL3/METTL14 install m6A marks, while ALKBH5 and FTO remove
                  them. NSUN methyltransferases curate m5C, and pseudouridine
                  synthases convert uridine to Ψ. The tug-of-war between writers
                  and erasers sculpts condition-specific landscapes.
                </p>
              </section>

              <section
                className="space-y-3"
                id="rna-modifications-matter-nanopore"
              >
                <h2 className="text-foreground text-xl font-semibold">
                  Nanopore signal signatures
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Oxford Nanopore's ionic current traces shift when modified
                  bases traverse the pore. Statistical modelling and neural
                  inference translate those signal perturbations into
                  single-read modification calls without reverse-transcription
                  bias.
                </p>
              </section>

              <section
                className="space-y-3"
                id="rna-modifications-matter-interpretation"
              >
                <h2 className="text-foreground text-xl font-semibold">
                  Biological interpretation
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Overlaying modification sites with expression, splicing, and
                  proteomic layers reveals phenotype drivers. Differential
                  analyses flag marks linked to development, stress, or disease
                  trajectories.
                </p>
              </section>
            </article>
            <div className="border-border bg-muted/40 text-muted-foreground flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-6 py-5 text-sm">
              <p>
                Ready to explore the implementation? Head back to the pipeline
                overview and see how these concepts turn into automation.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "input-files",
        title: "Input files for analysis",
        subsections: [
          { id: "input-files-overview", title: "Overview" },
          { id: "input-files-fast5", title: "FAST5 files" },
          { id: "input-files-pod5", title: "POD5 files" },
          { id: "input-files-fastq", title: "FASTQ files" },
          { id: "input-files-reference", title: "Reference FASTA" },
          { id: "input-files-summary", title: "What you need" },
        ],
        content: (
          <div className="space-y-8 leading-relaxed">
            <section className="space-y-3" id="input-files-overview">
              <h2 className="text-foreground text-xl font-semibold">
                Overview
              </h2>
              <p>
                To detect RNA modifications using nanopore sequencing, our
                pipeline requires specific file types that capture different
                aspects of the sequencing data. Each file type serves a unique
                purpose in reconstructing the epitranscriptomic landscape of
                your samples.
              </p>
            </section>

            <article className="border-border dark:bg-background space-y-8 rounded-3xl border bg-white p-6 sm:p-10">
              <section className="space-y-4" id="input-files-fast5">
                <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    Raw Signal
                  </span>
                  <h2 className="text-foreground text-xl font-semibold">
                    FAST5 Files
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  FAST5 is the legacy Oxford Nanopore Technologies (ONT) file
                  format that stores raw electrical signal data from nanopore
                  sequencing. As RNA molecules pass through the nanopore, they
                  cause characteristic disruptions in ionic current — these
                  &quot;squiggles&quot; are captured in FAST5 files.
                </p>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-muted-foreground text-sm">
                    <strong className="text-foreground">Why we need it:</strong>{" "}
                    The raw signal contains subtle variations that indicate RNA
                    modifications. Modified bases like m6A cause distinct
                    current shifts that wouldn&apos;t be visible in base-called
                    sequences alone. This is the foundation of direct RNA
                    modification detection.
                  </p>
                </div>
                <p className="text-muted-foreground text-xs">
                  <strong>Format:</strong> HDF5-based hierarchical data format |{" "}
                  <strong>Extension:</strong> .fast5
                </p>
              </section>

              <section className="space-y-4" id="input-files-pod5">
                <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    Raw Signal
                  </span>
                  <span className="bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    Recommended
                  </span>
                  <h2 className="text-foreground text-xl font-semibold">
                    POD5 Files
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  POD5 is the newer, more efficient ONT format that replaces
                  FAST5. It stores the same raw nanopore signal data but with
                  better compression and faster read/write performance. ONT is
                  transitioning all their tools to use POD5 as the primary
                  format.
                </p>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-muted-foreground text-sm">
                    <strong className="text-foreground">Why we need it:</strong>{" "}
                    Same purpose as FAST5 — providing raw signal for
                    modification detection — but with 30-50% smaller file sizes
                    and significantly faster processing. If you have recent
                    sequencing data, it&apos;s likely in POD5 format.
                  </p>
                </div>
                <p className="text-muted-foreground text-xs">
                  <strong>Format:</strong> Apache Arrow-based columnar format |{" "}
                  <strong>Extension:</strong> .pod5
                </p>
              </section>

              <section className="space-y-4" id="input-files-fastq">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    Sequences
                  </span>
                  <h2 className="text-foreground text-xl font-semibold">
                    FASTQ Files
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  FASTQ is the standard format for storing nucleotide sequences
                  along with their quality scores. These files contain the
                  base-called reads — the actual A, C, G, U (or T) sequences
                  derived from the raw signal data through basecalling
                  algorithms.
                </p>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-muted-foreground text-sm">
                    <strong className="text-foreground">Why we need it:</strong>{" "}
                    FASTQ sequences are essential for aligning reads to a
                    reference genome/transcriptome. This alignment tells us{" "}
                    <em>where</em> each read came from, allowing us to map
                    modification signals to specific genomic positions and
                    genes.
                  </p>
                </div>
                <p className="text-muted-foreground text-xs">
                  <strong>Format:</strong> Plain text with 4 lines per read |{" "}
                  <strong>Extensions:</strong> .fastq, .fq, .fastq.gz, .fq.gz
                  (gzip compressed)
                </p>
              </section>

              <section className="space-y-4" id="input-files-reference">
                <div className="flex items-center gap-3">
                  <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    Reference
                  </span>
                  <h2 className="text-foreground text-xl font-semibold">
                    Reference FASTA
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  A reference FASTA file contains the known genome or
                  transcriptome sequences for your organism of interest. This
                  serves as the &quot;map&quot; against which your sequencing
                  reads are aligned. Common sources include NCBI, Ensembl, or
                  GENCODE databases.
                </p>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-muted-foreground text-sm">
                    <strong className="text-foreground">Why we need it:</strong>{" "}
                    Without a reference, we can&apos;t determine where
                    modifications occur in the transcriptome. The reference
                    provides genomic coordinates, gene annotations, and the
                    expected unmodified sequence — critical for identifying
                    which positions carry epitranscriptomic marks.
                  </p>
                </div>
                <p className="text-muted-foreground text-xs">
                  <strong>Format:</strong> Plain text with header + sequence
                  lines | <strong>Provided as:</strong> URL to public reference
                  (e.g., from NCBI or Ensembl)
                </p>
              </section>
            </article>

            <section
              className="bg-muted/40 space-y-4 rounded-2xl p-6"
              id="input-files-summary"
            >
              <h2 className="text-foreground text-lg font-semibold">
                What you need to get started
              </h2>
              <div className="text-muted-foreground space-y-3 text-sm sm:text-base">
                <p>To run an analysis, you&apos;ll need:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <strong className="text-foreground">
                      Raw signal files:
                    </strong>{" "}
                    Either FAST5 or POD5 format (one or the other)
                  </li>
                  <li>
                    <strong className="text-foreground">Sequence reads:</strong>{" "}
                    FASTQ files (can be gzip compressed)
                  </li>
                  <li>
                    <strong className="text-foreground">Reference:</strong> URL
                    to a reference FASTA for your organism
                  </li>
                </ul>
                <p className="pt-2">
                  You can upload individual files or a single archive (.tar,
                  .tar.gz) containing your FAST5/POD5 and FASTQ files bundled
                  together.
                </p>
              </div>
            </section>

            <div className="border-border bg-muted/40 text-muted-foreground flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-6 py-5 text-sm">
              <p>
                <strong className="text-foreground">Testing tip:</strong> Don&apos;t
                have data yet? Use our mock mode by entering an accession
                starting with &quot;mock&quot; (e.g., mock-m6a) to explore the
                pipeline with synthetic data.
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "epitranscriptomics-sources",
        title: "Sources",
        content: (
          <div className="text-muted-foreground space-y-4 text-sm sm:text-base">
            <ul className="space-y-2">
              <li>
                Zhao, B. S., Roundtree, I. A., &amp; He, C. (2017).
                Epitranscriptomics: Regulation of mRNA metabolism through
                modifications. Nature Reviews Molecular Cell Biology, 18(1),
                31–42. https://doi.org/10.1038/nrm.2016.132
              </li>
              <li>
                Zhao, Y., Shi, Y., Shen, H., Xie, W., &amp; Yu, Z. (2023). The
                rise of epitranscriptomics: Recent developments and future
                directions. International Journal of Molecular Sciences, 24(1),
                221. https://doi.org/10.3390/ijms24010221
              </li>
              <li>
                Arribas-Hernández, L., &amp; Brodersen, P. (2023). Recent
                advances in the plant epitranscriptome. Genome Biology, 24,
                Article 156. https://doi.org/10.1186/s13059-023-02872-6
              </li>
              <li>
                Matthes, M., &amp; Müller, R. (2022). Epitranscriptomics: An
                additional regulatory layer in plants' development and stress
                response. Plants, 11(8), 1033.
                https://doi.org/10.3390/plants11081033
              </li>
              <li>
                Barbieri, I., &amp; Kouzarides, T. (2020). RNA editing in the
                forefront of epitranscriptomics and human health. Journal of
                Translational Medicine, 18, Article 79.
                https://doi.org/10.1186/s12967-019-2071-4
              </li>
              <li>
                Xiao, W., &amp; Yang, H. (2020). Mapping the epigenetic
                modifications of DNA and RNA. Protein &amp; Cell, 11, 548–571.
                https://doi.org/10.1007/s13238-020-00733-7
              </li>
            </ul>
          </div>
        ),
      },
    ],
    []
  );

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(sections.map((section) => [section.id, true]))
  );

  const handleToggle = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEnsureOpen = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <main className="text-foreground dark:bg-background min-h-screen bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
        <div className="flex flex-col gap-10">
          {sections.map((section) => (
            <CollapsibleSection
              key={section.id}
              {...section}
              isOpen={openSections[section.id]}
              onToggle={() => handleToggle(section.id)}
            />
          ))}
        </div>

        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-4 text-sm">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              On this page
            </p>
            <div className="space-y-2">
              {sections.map((section) => (
                <div key={`nav-${section.id}`} className="space-y-1">
                  <Link
                    href={`#${section.id}`}
                    onClick={() => handleEnsureOpen(section.id)}
                    className="text-foreground hover:bg-muted block rounded-md px-2 py-1 font-medium transition-colors"
                  >
                    {section.title}
                  </Link>
                  {section.subsections?.map((subsection) => (
                    <Link
                      key={`nav-${subsection.id}`}
                      href={`#${subsection.id}`}
                      onClick={() => handleEnsureOpen(section.id)}
                      className="text-muted-foreground hover:bg-muted block rounded-md px-4 py-1 transition-colors"
                    >
                      {subsection.title}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </nav>
        </aside>
      </div>
    </main>
  );
};

export default TheoryPage;
