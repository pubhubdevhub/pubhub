import {
  Button as RadixButton,
  DropdownMenu,
  Flex,
  Text,
  TextField,
  Select,
  Box,
} from "@radix-ui/themes"
import React, { useState } from "react"
import { BiFilter } from "react-icons/bi"
import { TbAdjustmentsHorizontal, TbCalendar, TbRefresh, TbSearch } from "react-icons/tb"
import { useSearchParams } from "react-router-dom-v5-compat"
import useSWR from "swr"

import { ClickableChecklistItem } from "../../../components/ClickableChecklistItem"
import { useFipDisplayOptions } from "../fip_tracker/useFipDisplayOptions"
import { DatePicker, DateRange } from "../fip_tracker/date_picker"
import { ConversationSummary } from "../../../reducers/conversations_summary"
import { ConversationEntry } from "./conversation_entry"
import { useAppSelector } from "../../../hooks"
import { CreateConversationDialog } from "../../CreateConversationDialog"


const conversationStatusOptions = {
  open: { label: "Open", color: "blue" },
  closed: { label: "Closed", color: "gray" },
}

export default () => {
  const allStatuses = ["open", "closed"]
  const [selectedConversationStatuses, setSelectedConversationStatuses] = useState<
    Record<string, boolean>
  >(Object.fromEntries(allStatuses.map((status) => [status, true])))
  const { user } = useAppSelector((state) => state.user)

  const {
    showAuthors,
    setShowAuthors,
    showCategory,
    setShowCategory,
    showCreationDate,
    setShowCreationDate,
    showType,
    setShowType,
    sortBy,
    setSortBy,
    resetDisplayOptions,
    saveDisplayOptions,
  } = useFipDisplayOptions()

  const [searchParams, setSearchParams] = useSearchParams()

  const viewParam = searchParams.get("view") || ""
  const searchParam = searchParams.get("search") || ""

  const { data } = useSWR(
    `conversations_summary_sentiment_checks`,
    async () => {
      const response = await fetch(`/api/v3/conversations_summary`)
      // process the fip_version part if it exists
      // and any other extra fields
      const conversations = (await response.json()) as ConversationSummary[]
      const conversationsWithoutFips = conversations.filter(
        (conversation) => conversation.fip_version === null,
      )
      const conversationsWithExtraFields = conversationsWithoutFips.map((conversation) => {
        const displayed_title = conversation.topic

        return { ...conversation, displayed_title }
      })
      return { conversations: conversationsWithExtraFields }
    },
    { keepPreviousData: true, focusThrottleInterval: 500 },
  )

  const conversations = data?.conversations || []

  const [rangeValue, setRangeValue] = useState<DateRange>({ start: null, end: null })

  let sortFunction
  if (sortBy === "asc") {
    sortFunction = (c1, c2) => (c1.fip_created > c2.fip_created ? 1 : -1)
  } else if (sortBy === "desc") {
    sortFunction = (c1, c2) => (c1.fip_created > c2.fip_created ? -1 : 1)
  } else {
    sortFunction = (c1, c2) => (c1.fip_number > c2.fip_number ? 1 : -1)
  }

  const displayedConversations = (conversations || [])
    .filter((conversation) => {
      // the conversation's displayed title must include the search string, if it is given
      if (
        searchParam &&
        !conversation.displayed_title.toLowerCase().includes(searchParam.toLowerCase())
      ) {
        return false
      }

      if (conversation.is_archived && !selectedConversationStatuses.closed) {
        return false
      }

      if (!conversation.is_archived && !selectedConversationStatuses.open) {
        return false
      }

      return true
    })
    .toSorted(sortFunction)

  return (
    <Box>
      <Flex
        px="3"
        py="3"
        pt="6"
        direction="column"
        gap="3"
      >
        <Flex direction="row" align="center">
          <Text weight="bold" size="4">Sentiment Checks</Text>
          <Box
            position="absolute"
            right="3"
          >
            <CreateConversationDialog />
          </Box>
        </Flex>
        <Flex gap="2" width="100%">
          <Box flexGrow="1" maxWidth="400px">
            <TextField.Root
              placeholder="Search..."
              value={(searchParams as any).get("search") || ""}
              onChange={(e) => setSearchParams({ search: e.target.value })}
            >
              <TextField.Slot>
                <TbSearch style={{ color: "#B4B6C2" }} />
              </TextField.Slot>
            </TextField.Root>
          </Box>
          <Box flexGrow="1"></Box>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <RadixButton variant="surface">
                <BiFilter size="1.1em" style={{ color: "var(--accent-a11)", top: "-1px" }} />
                Filters
              </RadixButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger>
                  <TbRefresh /> Status
                </DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent>
                <ClickableChecklistItem
                  color={"blue"}
                  checked={Object.values(selectedConversationStatuses).every((value) => value === true)}
                  setChecked={(value) => {
                    setSelectedConversationStatuses(() =>
                      Object.fromEntries(allStatuses.map((key) => [key, value]),),
                    )
                  }}
                >
                  All
                </ClickableChecklistItem>
                <DropdownMenu.Separator />
                  {allStatuses.map((status) => (
                    <ClickableChecklistItem
                      key={status}
                      color={conversationStatusOptions[status].color}
                      checked={selectedConversationStatuses[status]}
                      setChecked={(value) => {
                        setSelectedConversationStatuses((prev) => ({ ...prev, [status]: value }))
                      }}
                      showOnly={true}
                      selectOnly={() => {
                        setSelectedConversationStatuses(() =>
                          Object.fromEntries(allStatuses.map((key) => [key, key === status])),
                        )
                      }}
                    >
                      {conversationStatusOptions[status].label}
                    </ClickableChecklistItem>
                  ))}
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger>
                  <TbCalendar /> Date
                </DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent>
                  <DatePicker
                    rangeValue={rangeValue}
                    onRangeValueChange={(range) => setRangeValue(range)}
                  />
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <RadixButton variant="surface">
                <TbAdjustmentsHorizontal style={{ color: "var(--accent-a11)" }} />
                Display
              </RadixButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>
                Sort by&nbsp;
                <Select.Root
                  defaultValue={sortBy || "desc"}
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as "asc" | "desc")}
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Group>
                      <Select.Item value="desc">Newest to Oldest</Select.Item>
                      <Select.Item value="asc">Oldest to Newest</Select.Item>
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              </DropdownMenu.Label>
              <DropdownMenu.Separator />
              <DropdownMenu.Label>Show / Hide</DropdownMenu.Label>
              <ClickableChecklistItem checked={showType} setChecked={setShowType}>
                Type
              </ClickableChecklistItem>
              <ClickableChecklistItem checked={showCategory} setChecked={setShowCategory}>
                Category
              </ClickableChecklistItem>
              <ClickableChecklistItem checked={showCreationDate} setChecked={setShowCreationDate}>
                Creation Date
              </ClickableChecklistItem>
              <ClickableChecklistItem checked={showAuthors} setChecked={setShowAuthors}>
                Authors
              </ClickableChecklistItem>
              <DropdownMenu.Separator />
              <DropdownMenu.Label
                onClick={(e) => {
                  e.preventDefault()
                }}
              >
                <RadixButton color="gray" variant="ghost" onClick={resetDisplayOptions}>
                  Reset
                </RadixButton>
                <Box flexGrow="1"></Box>
                <RadixButton variant="ghost" onClick={saveDisplayOptions}>
                  Save as default
                </RadixButton>
              </DropdownMenu.Label>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
        <Flex direction="column" gap="3">
          {displayedConversations.map((conversation) => (
            <ConversationEntry
              scrollOnLoad={viewParam === conversation.conversation_id}
              key={conversation.conversation_id}
              conversation={conversation}
              showCreationDate={showCreationDate}
            />
          ))}
        </Flex>
      </Flex>
    </Box>
  )
}
