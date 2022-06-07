import React, { useEffect, useState, useMemo } from "react";
import "akvo-react-form/dist/index.css";
import "./datapoints.scss";
import { Row, Col, Tabs, Table, Button } from "antd";
import { AiOutlinePlus, AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { api, store } from "../../lib";

const panes = [
  {
    title: "Pending",
    key: "1",
  },
  {
    title: "Approved",
    content: "Approved",
    key: "2",
  },
  {
    title: "Rejected",
    key: "3",
  },
];

const DataPoints = () => {
  const { id } = useParams();
  const { isLoggedIn } = store.useState((s) => s);
  const { state: routeState } = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState({ data: [], total: 0 });
  const [selectedTab, setSelectedTab] = useState(panes[0].key);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);

  const handleTabsChange = (activeKey) => {
    setLoading(true);
    setCurrentPage(1);
    const activePane = panes.find((p) => p.key === activeKey);
    setSelectedTab(activeKey);
    setStatus(activePane?.title.toLowerCase());
  };

  const columns = useMemo(() => {
    const head_cols = [
      {
        title: () => (
          <span className="normalize sort">
            <div className="sortIcons">
              <AiOutlineUp />
              <AiOutlineDown />
            </div>
            Sort By
          </span>
        ),
        dataIndex: "name",
        width: "40%",
        ellipsis: true,
        className: "datapoint-name",
      },
      {
        title: () => <span className="normalize">Submittant</span>,
        dataIndex: "submitter",
        ellipsis: true,
        className: "submitter",
      },
    ];
    const tail_cols = [
      {
        title: "Submitted Date",
        dataIndex: "submitted_at",
        ellipsis: true,
      },
      {
        title: "",
        dataIndex: "",
        width: "75px",
        render: (_, value) => {
          const thisUrl = `/dashboard/${id}/${value.id}`;
          const thisBreadCrumb = {
            page: value.name,
            target: thisUrl,
          };
          const thisRouteState = {
            state: {
              breadcrumbs: [...routeState.breadcrumbs, thisBreadCrumb],
              previewOnly: status === "approved",
            },
          };
          return (
            <Button
              onClick={() => {
                navigate(thisUrl, thisRouteState);
              }}
              className="add-btn"
              type="primary"
            >
              <AiOutlinePlus />
            </Button>
          );
        },
      },
    ];
    if (status !== "pending") {
      return [
        ...head_cols,
        {
          title: () => (
            <span className="normalize">
              {status === "approved" ? "Approved By" : "Rejected By"}
            </span>
          ),
          dataIndex: "approved_by",
          ellipsis: true,
          className: "submitter",
        },
        ...tail_cols,
      ];
    }
    return [...head_cols, ...tail_cols];
  }, [id, status, navigate, routeState]);

  useEffect(() => {
    if (isLoggedIn) {
      api
        .get(
          `/data?form_id=${id}&status=${status}&page=${currentPage}&perpage=10`
        )
        .then((res) => {
          const { data } = res;
          setData(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setData({ data: [], total: 0 });
        });
    }
  }, [id, status, selectedTab, currentPage, isLoggedIn]);

  const handlePaginationChange = (e) => {
    setLoading(true);
    setCurrentPage(e.current);
  };

  const TabExtraContent = useMemo(
    () => (
      <h3 className="total">
        Total:
        <small> {data?.total}</small>
      </h3>
    ),
    [data]
  );

  return (
    <div id="datapoints" className="main">
      <Row className="content-container">
        <Col span={24}>
          <div className="content">
            <Tabs
              defaultActiveKey="1"
              activeKey={selectedTab.activeKey}
              onChange={handleTabsChange}
              tabBarExtraContent={TabExtraContent}
            >
              {panes.map((p) => (
                <Tabs.TabPane tab={p.title} key={p.key} />
              ))}
            </Tabs>
            <Table
              columns={columns}
              dataSource={data?.data}
              onChange={handlePaginationChange}
              pagination={{
                current: currentPage,
                total: data?.total,
                pageSize: 10,
                showSizeChanger: false,
              }}
              rowClassName={(_, index) =>
                index % 2 === 0 ? "row-light" : "row-dark"
              }
              loading={loading}
              rowKey="id"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DataPoints;
