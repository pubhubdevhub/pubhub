import React, { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

import { formatTimeAgo } from "../../util/misc"
import Spinner from "../../components/spinner"
import api from "../../util/api"
import ConversationsList from "./conversations_list"
import { BiSolidBarChartAlt2 } from "react-icons/bi"
import { ListingSelector } from "./listing_selector"
import { TbFocus } from "react-icons/tb"
import { Box, Button, Flex, Link, Text } from "@radix-ui/themes"

const LogoBlock = () => {
  return (
    <Flex gap="2">
      <img
        src="/filecoin.png"
        width="25"
        height="25"
      />
      <Text
        color="gray"
        weight="bold"
        highContrast
      >
        Fil Poll
      </Text>
    </Flex>
  )
}

const LastSync = ({ lastSync, syncInProgress, syncPRs }: { lastSync: number; syncInProgress: boolean; syncPRs: () => void }) => {
  return <Flex justify="center" align="center" pb="3">
    <Text>
    Last sync: {isNaN(lastSync) ? "n/a" : formatTimeAgo(lastSync)} &nbsp;
    </Text>
    <Link href="#" onClick={() => syncPRs()}>
      {syncInProgress ? <Spinner size={26} /> : `Sync now`}
    </Link>
  </Flex>
}

const Sidebar = ({mobileMenuOpen}: {mobileMenuOpen: boolean}) => {
  const [syncInProgress, setSyncInProgress] = useState(false)
  const [lastSync, setLastSync] = useState<number>()
  const [selectedView, setSelectedView] = useState<"all" | "fips" | "polls">("all")

  useEffect(() => {
    api.get("/api/v3/github_syncs", {}).then((result) => {
      if (!result.success) return
      const lastSync = Date.parse(result.latest.ts)
      setLastSync(lastSync)
    })
  }, [])

  const syncPRs = () => {
    // github sync
    setSyncInProgress(true)
    toast.success("Connecting to Github...")
    api
      .post("api/v3/github_sync", {})
      .then(({ existingFips, openPulls, fipsUpdated, fipsCreated }) => {
        toast.success(`Downloading ${existingFips} FIPs, ${openPulls} open PRs...`)
        setTimeout(() => {
          toast.success(`Updating ${fipsUpdated} FIPs, creating ${fipsCreated} new FIPs...`)
          setTimeout(() => {
            document.location.reload()
          }, 2000)
        }, 2000)
      })
      .fail((error) => {
        toast.error("Sync error")
        console.error(error)
      })
      .always(() => {
        setSyncInProgress(false)
      })
  }

  return <Box
    display={mobileMenuOpen ? "block" : { initial: "none", sm: "block" }}
    width={{ initial: "100%", sm: "40%", md: "340px" }}
    maxHeight="100vh"
    overflow="hidden"
    position="relative"
  >
    <div style={{
      height: "100%",
      width: "100%",
      borderRight: "1px solid #e2ddd5",
      flexDirection: "column",
      display: "flex",
    }}>
      <Flex
        width="100%"
        pt="14px"
        pb="14px"
        px="18px"
        align="center"
      >
        <Link href="/dashboard">
          <LogoBlock />
        </Link>
      </Flex>
      <ListingSelector
        to="/dashboard/sentiment_checks"
        iconType={BiSolidBarChartAlt2}
        label="Sentiment Checks"
      />
      <ListingSelector to="/dashboard/fip_tracker" iconType={TbFocus} label="FIP Tracker" />
      {/* <Flex>
        <Button onClick={() => setSelectedView("all")}>All</Button>
        <Button onClick={() => setSelectedView("fips")}>FIPs</Button>
        <Button onClick={() => setSelectedView("polls")}>Polls</Button>
      </Flex> */}
      <ConversationsList selectedView={selectedView} />
      <LastSync lastSync={lastSync} syncInProgress={syncInProgress} syncPRs={syncPRs} />
    </div>
  </Box>
}

export default Sidebar
