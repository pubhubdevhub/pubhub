import dayjs from "dayjs"
import React, { MutableRefObject, Ref, RefObject, useEffect, useRef, useState } from "react"
import { TbArrowUpRight, TbCalendar, TbChevronDown, TbChevronRight } from "react-icons/tb"
import { Link } from "react-router-dom-v5-compat"

import { Badge, Box, Flex, Grid, Text } from "@radix-ui/themes"
import { statusOptions } from "./status_options"
import { FipVersion } from "../../../util/types"
import { UserInfo } from "./splitAuthors"
import SimpleSummary from "./simple_summary"
import { BiLink } from "react-icons/bi"

const FIP_REPO_OWNER = process.env.FIP_REPO_OWNER || "filecoin-project"
const FIP_REPO_NAME = process.env.FIP_REPO_NAME || "FIPs"

const FipEntryInner = ({
  conversation,
}: {
  conversation: FipVersion & {
    displayed_title: string
    fip_authors: UserInfo[]
  }
}) => {
  return (
    <>
      <Box></Box>
      {/* display the simple summary if possible otherwise display the whole fip description */}
      <Box mb="6px">
        <h3 style={{ margin: "14px 0 10px" }}>Authors</h3>
        {conversation.fip_authors.length === 0
          ? conversation.fip_author
          : conversation.fip_authors.map((author, i) => {
              return (
                <React.Fragment key={author.username || author.email || author.name}>
                  {author.username ? (
                    <Link
                      className="link"
                      onClick={(e) => e.stopPropagation()}
                      to={`https://github.com/${author.username}`}
                      target="_blank"
                      noreferrer="noreferrer"
                      noopener="noopener"
                    >
                      @{author.username}
                    </Link>
                  ) : (
                    author.email
                  )}
                  {i < conversation.fip_authors.length - 1 ? ", " : ""}
                </React.Fragment>
              )
            })}
        <div
          onClick={(e) => {
            // It's possible that there could be a tag inside the link,
            // but we don't handle that case here
            // @ts-expect-error - TS doesn't know about tagName
            if (e.target.tagName === "A") {
              e.stopPropagation()
            }
          }}
        >
          <SimpleSummary content={conversation.fip_content} />
        </div>
      </Box>
    </>
  )
}

export const FipEntry = ({
  scrollOnLoad,
  conversation,
  showAuthors,
  showCategory,
  showCreationDate,
  showType,
}: {
  scrollOnLoad: boolean
  conversation: FipVersion & {
    displayed_title: string
    fip_authors: UserInfo[]
  }
  showAuthors: boolean
  showCategory: boolean
  showCreationDate: boolean
  showType: boolean
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (scrollOnLoad && ref.current) {
      ref.current.scrollIntoView()
      setIsOpen(true)
    }
  }, [])

  let fipStatusKey = conversation.fip_status.toLowerCase().replace(" ", "-")
  if (fipStatusKey === "wip") {
    fipStatusKey = "draft"
  } else if (!conversation.fip_status) {
    fipStatusKey = "unknown"
  }
  if (conversation.github_pr?.merged_at || conversation.github_pr?.closed_at) {
    fipStatusKey = "closed"
  }

  const fipStatusInfo = fipStatusKey ? statusOptions[fipStatusKey] : statusOptions.draft
  const fipStatusLabel = statusOptions[fipStatusKey]
    ? statusOptions[fipStatusKey].label
    : fipStatusKey

  const fipBadges = []
  if (showType && conversation.fip_type) {
    fipBadges.push(
      <Badge
        key="type"
        size="2"
        variant="outline"
        radius="full"
        style={{
          boxShadow: "inset 0 0 0 1px var(--accent-a5)",
        }}
      >
        {conversation.fip_type}
      </Badge>,
    )
  }
  if (showCategory && conversation.fip_category) {
    fipBadges.push(
      <Badge
        key="category"
        size="2"
        variant="outline"
        radius="full"
        style={{
          boxShadow: "inset 0 0 0 1px var(--accent-a5)",
        }}
      >
        {conversation.fip_category}
      </Badge>,
    )
  }

  let fileUrl = null
  if (conversation.github_pr === null) {
    // file link
    const updatedFiles = (conversation.fip_files_updated || "").split("\n")
    if (updatedFiles.length > 0) {
      // strip leading and trailing slashes and join the rest
      const updatedFile = updatedFiles[0]
        .split("/")
        .filter((x) => x !== "")
        .join("/")
      fileUrl = `https://github.com/${FIP_REPO_OWNER}/${FIP_REPO_NAME}/blob/master/${updatedFile}`
    }

    const createdFiles = (conversation.fip_files_created || "").split("\n")
    if (createdFiles.length > 0) {
      // strip leading and trailing slashes and join the rest
      const createdFile = createdFiles[0]
        .split("/")
        .filter((x) => x !== "")
        .join("/")
      fileUrl = `https://github.com/${FIP_REPO_OWNER}/${FIP_REPO_NAME}/blob/master/${createdFile}`
    }
  }

  return (
    <div
      ref={ref}
      style={{
        borderRadius: "8px",
        borderStyle: "solid",
        borderWidth: "1px",
        borderLeftWidth: "4px",
        // this uses the color palette defined by radix-ui
        borderColor: fipStatusInfo.color === "gray" ? `#ccc` : `var(--${fipStatusInfo.color}-10)`,
        padding: "3px 0 6px",
        background: "#fff",
        fontSize: "95%",
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <Grid
        m="10px"
        columns="20px 1fr"
        rows="auto auto"
        gapY="10px"
        gapX="10px"
        pr="10px"
      >
        <Flex
          direction="row"
          gap="4"
          align="center"
        >
          {isOpen ? <TbChevronDown /> : <TbChevronRight />}
        </Flex>
        <Flex
          direction="row"
          gap="3"
          align="center"
        >
          <Text
            style={{
              fontWeight: "bold",
              display: "inline-block",
              width: "48px",
              flex: "0 0 auto",
            }}
          >
            {conversation.fip_number ? String(conversation.fip_number).padStart(4, "0") : "Draft"}
          </Text>
          <Box flexGrow="1">
          <Text style={{ flex: 1, lineHeight: 1.3, fontWeight: 500 }}>
            {conversation.displayed_title || <Text color="gray">Untitled</Text>}
          </Text>
          </Box>
          <Badge size="2" color={fipStatusInfo.color} variant="surface" radius="full">
            {fipStatusLabel}
          </Badge>
          {fileUrl && (
            <Link
              className="link"
              to={fileUrl}
              target="_blank"
              noreferrer="noreferrer"
              noopener="noopener"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "block",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
                fontSize: "90%",
                fontWeight: "500",
              }}
            >
              GitHub <TbArrowUpRight style={{ position: "relative", top: "2px" }} />
            </Link>
          )}
          {conversation.github_pr && (
            <Link
              className="link"
              to={conversation.github_pr.url.replace(/\/files$/, "")}
              target="_blank"
              noreferrer="noreferrer"
              noopener="noopener"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "block",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
                fontSize: "90%",
                fontWeight: "500",
              }}
            >
              PR <TbArrowUpRight style={{ position: "relative", top: "2px" }} />
            </Link>
          )}
          <Link
              className="link"
              to={`/dashboard/fip_tracker?view=${conversation.id}`}
              target="_blank"
              noreferrer="noreferrer"
              noopener="noopener"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "block",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
                fontSize: "90%",
                fontWeight: "500",
              }}
            >
            <BiLink style={{top: "0px"}}/>
          </Link>
        </Flex>
        <Box></Box>
        <Flex
          direction="row"
          gap="2"
          align="center"
          style={{  fontSize: "95%" }}
        >
          {fipBadges}
          {showCreationDate && (
            <Text style={{ fontSize: "94%", opacity: 0.7, whiteSpace: "nowrap" }}>
              {fipBadges.length > 0 && (
                <Text
                  style={{
                    marginLeft: "2px",
                    marginRight: "9px",
                    top: "-1px",
                    position: "relative",
                    opacity: 0.5,
                  }}
                >
                  |
                </Text>
              )}
              <Flex
                align="center"
                gap="1"
                style={{
                  display: "inline-block",
                  whiteSpace: "nowrap",
                }}
              >
                <TbCalendar />
                <Text> {dayjs(conversation.fip_created).format("YYYY-MM-DD")}</Text>
              </Flex>
            </Text>
          )}
          {showAuthors && (
            <Text style={{ fontSize: "94%", opacity: 0.7, whiteSpace: "nowrap" }}>
              {(fipBadges.length > 0 || showCreationDate) && (
                <Text
                  style={{
                    marginLeft: "2px",
                    marginRight: "9px",
                    top: "-1px",
                    position: "relative",
                    opacity: 0.5,
                  }}
                >
                  |
                </Text>
              )}
              <Text wrap="nowrap">
                {conversation.fip_authors.length} author
                {conversation.fip_authors.length > 1 ? "s" : ""}
              </Text>
            </Text>
          )}
          <Box flexGrow="1"></Box>
        </Flex>
        {isOpen && <FipEntryInner conversation={conversation} />}
      </Grid>
    </div>
  )
}
