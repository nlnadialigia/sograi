-- CreateTable
CREATE TABLE "pull_requests" (
    "id" SERIAL NOT NULL,
    "pull_request_id" VARCHAR(50) NOT NULL,
    "organization" VARCHAR(100),
    "project" VARCHAR(100),
    "repository" VARCHAR(100),
    "title" TEXT,
    "author" VARCHAR(150),
    "source_branch" VARCHAR(255),
    "target_branch" VARCHAR(255),
    "status" VARCHAR(50),
    "decision" VARCHAR(50),
    "total_files_changed" INTEGER NOT NULL DEFAULT 0,
    "files_with_issues" INTEGER NOT NULL DEFAULT 0,
    "duration_seconds" DECIMAL(10,2),
    "executive_summary" TEXT,
    "risk_level" VARCHAR(20) DEFAULT 'MEDIO',
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "iteration" INTEGER NOT NULL DEFAULT 1,
    "time_to_fix" VARCHAR(50),
    "executive_verdict" VARCHAR(50),
    "change_summary" TEXT,
    "recommendation" TEXT,
    "executive_markdown" TEXT,
    "spec_markdown" TEXT,
    "full_markdown" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pull_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pr_file_reviews" (
    "id" SERIAL NOT NULL,
    "pr_id" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,
    "decision" VARCHAR(50) NOT NULL,
    "change_type" VARCHAR(20) DEFAULT 'edit',
    "justification" TEXT,
    "raw_analysis" JSONB,
    "file_lines" INTEGER DEFAULT 0,
    "file_bytes" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pr_file_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pr_file_issues" (
    "id" SERIAL NOT NULL,
    "file_review_id" INTEGER NOT NULL,
    "agent_category" VARCHAR(50) NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "line_reference" VARCHAR(50),
    "suggested_code" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pr_file_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_reviews" (
    "id" SERIAL NOT NULL,
    "file_review_id" INTEGER NOT NULL,
    "agent_name" VARCHAR(50) NOT NULL,
    "issues_text" TEXT,
    "decision" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pr_tracking_items" (
    "id" SERIAL NOT NULL,
    "pull_request_id" VARCHAR(50) NOT NULL,
    "organization" VARCHAR(100) NOT NULL,
    "project" VARCHAR(100) NOT NULL,
    "repository" VARCHAR(100) NOT NULL,
    "file_path" TEXT NOT NULL,
    "initial_decision" VARCHAR(50) NOT NULL,
    "initial_issue_title" VARCHAR(255) NOT NULL,
    "initial_issue_description" TEXT NOT NULL,
    "current_status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "resolution_notes" TEXT,
    "last_iteration_checked" INTEGER NOT NULL DEFAULT 1,
    "first_identified_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pr_tracking_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pr_manual_pending_items" (
    "id" SERIAL NOT NULL,
    "pull_request_id" VARCHAR(50) NOT NULL,
    "repository" VARCHAR(100) NOT NULL,
    "file_path" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "item_type" VARCHAR(50) NOT NULL DEFAULT 'TECH_DEBT',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "author_name" VARCHAR(100) DEFAULT 'Tech Lead',
    "resolution_notes" TEXT,
    "resolved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pr_manual_pending_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_pr_id" ON "pull_requests"("pull_request_id");

-- CreateIndex
CREATE INDEX "idx_pr_repo" ON "pull_requests"("repository");

-- CreateIndex
CREATE UNIQUE INDEX "uk_pull_requests_repo_pr" ON "pull_requests"("organization", "project", "repository", "pull_request_id");

-- CreateIndex
CREATE INDEX "idx_file_pr_id" ON "pr_file_reviews"("pr_id");

-- CreateIndex
CREATE INDEX "idx_issue_file_id" ON "pr_file_issues"("file_review_id");

-- CreateIndex
CREATE INDEX "idx_agent_file_id" ON "agent_reviews"("file_review_id");

-- CreateIndex
CREATE INDEX "idx_tracking_pr" ON "pr_tracking_items"("pull_request_id", "repository");

-- CreateIndex
CREATE UNIQUE INDEX "uk_tracking_item" ON "pr_tracking_items"("organization", "project", "repository", "pull_request_id", "file_path");

-- CreateIndex
CREATE INDEX "idx_manual_pending_pr" ON "pr_manual_pending_items"("pull_request_id", "repository");

-- CreateIndex
CREATE INDEX "idx_manual_pending_status" ON "pr_manual_pending_items"("status");

-- AddForeignKey
ALTER TABLE "pr_file_reviews" ADD CONSTRAINT "pr_file_reviews_pr_id_fkey" FOREIGN KEY ("pr_id") REFERENCES "pull_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pr_file_issues" ADD CONSTRAINT "pr_file_issues_file_review_id_fkey" FOREIGN KEY ("file_review_id") REFERENCES "pr_file_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_reviews" ADD CONSTRAINT "agent_reviews_file_review_id_fkey" FOREIGN KEY ("file_review_id") REFERENCES "pr_file_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

