"use client"

import { Icon } from "@iconify/react"
import { motion } from "motion/react"
import { RevealText } from "@/components/ui/RevealText"

const ICON_MAP: Record<string, string> = {
  // AI
  "Anthropic": "simple-icons:anthropic",
  "OpenAI": "simple-icons:openai",
  "Google Gemini": "simple-icons:googlegemini",
  "Meta LLaMA": "simple-icons:meta",
  "DeepSeek": "simple-icons:deepseek",
  "Mistral": "simple-icons:mistral",
  "Hugging Face": "simple-icons:huggingface",
  "OpenClaw": "simple-icons:openai",
  "n8n": "simple-icons:n8n",
  "LangChain": "simple-icons:langchain",
  "PyTorch": "simple-icons:pytorch",
  "Ollama": "simple-icons:ollama",
  // Cloud
  "AWS": "simple-icons:amazonwebservices",
  "Google Cloud": "simple-icons:googlecloud",
  "Microsoft Azure": "simple-icons:microsoftazure",
  "Kubernetes": "simple-icons:kubernetes",
  "Terraform": "simple-icons:terraform",
  "Pulumi": "simple-icons:pulumi",
  // Dev
  "Next.js 16": "simple-icons:nextdotjs",
  "React 19": "simple-icons:react",
  "TypeScript 5": "simple-icons:typescript",
  "Bun": "simple-icons:bun",
  "Rust": "simple-icons:rust",
  "Go": "simple-icons:go",
  // Data
  "PostgreSQL": "simple-icons:postgresql",
  "ClickHouse": "simple-icons:clickhouse",
  "Apache Kafka": "simple-icons:apachekafka",
  "Apache Flink": "simple-icons:apacheflink",
  "Grafana": "simple-icons:grafana",
  "dbt": "simple-icons:dbt",
}

const SPEEDS = [25, 30, 35, 28, 32]

interface TechStackContent {
  sectionId: string
  title: string
  categories: readonly {
    name: string
    items: readonly string[]
  }[]
}

function MarqueeRow({
  category,
  speed,
  index,
}: {
  category: { name: string; items: readonly string[] }
  speed: number
  index: number
}) {
  const items = category.items
  const doubled = [...items, ...items]
  const direction = index % 2 === 0 ? "normal" : "reverse"

  return (
    <div className="flex items-center border-b border-[#e5e5e5] last:border-b-0">
      <div className="w-40 md:w-52 shrink-0 py-6 pr-6 pl-6">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#a3a3a3]">
          {category.name}
        </span>
      </div>

      <div className="flex-1 overflow-hidden py-6">
        <div
          className="marquee-track flex items-center gap-10 w-max"
          style={{
            animation: `marquee ${speed}s linear infinite`,
            animationDirection: direction,
          }}
        >
          {doubled.map((item, i) => {
            const iconName = ICON_MAP[item]
            return (
              <div
                key={`${item}-${i}`}
                className="flex items-center gap-2.5 shrink-0"
              >
                {iconName && (
                  <Icon
                    icon={iconName}
                    width={20}
                    height={20}
                    className="text-[#525252]"
                  />
                )}
                <span className="text-sm font-medium text-[#0a0a0a] whitespace-nowrap">
                  {item}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function TechStack({ content }: { content: TechStackContent }) {
  return (
    <section
      id={content.sectionId}
      className="py-32 bg-[#f8f8f8] border-t border-[#e5e5e5]"
    >
      <div className="mx-auto max-w-7xl px-6">
        <RevealText
          as="h2"
          className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] text-center mb-16"
        >
          {content.title}
        </RevealText>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="marquee-container bg-white border border-[#e5e5e5] rounded-[6px] overflow-hidden"
        >
          {content.categories.map((cat, i) => (
            <MarqueeRow
              key={cat.name}
              category={cat}
              speed={SPEEDS[i % SPEEDS.length]}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
