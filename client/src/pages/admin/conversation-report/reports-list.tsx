import React from "react"
import PropTypes from "prop-types"
import { Box, Button } from "@radix-ui/themes"
import api from "../../../util/api"
import ComponentHelpers from "../../../util/component-helpers"
import NoPermission from "../no-permission"

class ReportsList extends React.Component<
  {
    conversation_id: string
  },
  {
    loading: boolean
    reports: Array<{ report_id: string }>
  }
> {
  static propTypes: {}

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      reports: [],
    }
  }

  getData() {
    const reportsPromise = api.get("/api/v3/reports", {
      conversation_id: this.props.conversation_id,
    })
    reportsPromise.then((reports) => {
      this.setState({
        loading: false,
        reports: reports,
      })
    })
  }

  componentDidMount() {
    this.getData()
  }

  createReportClicked() {
    api
      .post("/api/v3/reports", {
        conversation_id: this.props.conversation_id,
      })
      .then(() => {
        this.getData()
      })
  }

  render() {
    if (ComponentHelpers.shouldShowPermissionsError(this.props)) {
      return <NoPermission />
    }

    if (this.state.loading) {
      return <div>Loading Reports...</div>
    }

    const conversation_id = this.props.conversation_id

    return (
      <Box>
        <Box my="3">
          {this.state.reports.length === 0 ? (
            <Button onClick={this.createReportClicked.bind(this)}>Create report url</Button>
          ) : (
            <Button
              onClick={() => {
                document.location = `/r/${conversation_id}/${this.state.reports[0].report_id}`
              }}
            >
              Go to full report
            </Button>
          )}
        </Box>
        <Box my="3">
          <Button
            mr="2"
            onClick={() => {
              document.location = `/api/v3/dataExport/participants.csv?conversation_id=${conversation_id}`
            }}
          >
            Participants (CSV)
          </Button>
          <Button
            mr="2"
            onClick={() => {
              document.location = `/api/v3/dataExport/votes.csv?conversation_id=${conversation_id}`
            }}
          >
            Votes (CSV)
          </Button>
          <Button
            mr="2"
            onClick={() => {
              document.location = `/api/v3/dataExport/comments.csv?conversation_id=${conversation_id}`
            }}
          >
            Comments (CSV)
          </Button>
        </Box>
        <Box my="3">
          <Button
            mr="2"
            onClick={() => {
              document.location = `/api/v3/dataExport/participants?conversation_id=${conversation_id}`
            }}
          >
            Participants (JSON)
          </Button>
          <Button
            mr="2"
            onClick={() => {
              document.location = `/api/v3/dataExport/votes?conversation_id=${conversation_id}`
            }}
          >
            Votes (JSON)
          </Button>
          <Button
            mr="2"
            onClick={() => {
              document.location = `/api/v3/dataExport/comments?conversation_id=${conversation_id}`
            }}
          >
            Comments (JSON)
          </Button>
        </Box>
      </Box>
    )
  }
}

ReportsList.propTypes = {
  conversation_id: PropTypes.string,
}

export default ReportsList
