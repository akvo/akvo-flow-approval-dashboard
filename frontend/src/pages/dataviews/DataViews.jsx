import React, { useEffect, useState } from "react";
import "./dataviews.scss";
import { Row, Col, message, Carousel, Image } from "antd";
import { Webform } from "akvo-react-form";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { api, store } from "../../lib";
import { Loading } from "../../components";
import { dropRight, takeRight } from "lodash";

const initForms = {
  forms: {
    name: "Loading",
    question_group: [],
  },
  initial_value: [],
};

const DataViews = ({ closeTour }) => {
  closeTour();
  const { data_id } = useParams();
  const navigate = useNavigate();
  const { state: routeState } = useLocation();
  const { isLoggedIn } = store.useState((s) => s);
  const [forms, setForms] = useState(initForms);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(true);

  const questions = forms.forms.question_group
    .map((q) => q.question)
    .flatMap((q) => q);

  const onFinish = (data) => {
    setSubmitting(true);
    const instance = forms.forms.app;
    const version = forms.forms.version;
    const answers = Object.keys(data)
      .map((k) => {
        const q = k.split("-");
        const value = data[k];
        const question = questions.find(
          (qs) => parseInt(qs["id"]) === parseInt(q[0])
        );
        let answer = {
          questionId: parseInt(q[0]),
          iteration: q.length === 2 ? parseInt(q[1]) : 0,
          value: value,
          answerType: question.original_type,
        };
        if (question?.api && value) {
          const cascadeApi = question.api.endpoint;
          const cascadeValue = answer.value.map((v, vi) => {
            if (!vi) {
              return {
                api: `${cascadeApi}/0`,
                id: v,
              };
            }
            return {
              api: `${cascadeApi}/${answer.value[vi - 1]}`,
              id: v,
            };
          });
          answer = { ...answer, value: cascadeValue };
        }
        return answer;
      })
      .filter((x) => x?.value);
    const payload = { answers: answers, instance: instance, version: version };
    api
      .post(`/data/${data_id}`, payload, {
        "content-type": "application/json",
      })
      .then(() => {
        const breadcrumbs = dropRight(routeState.breadcrumbs);
        const before = takeRight(breadcrumbs)[0];
        message.success("Success");
        setTimeout(() => {
          navigate(before.target, { state: { breadcrumbs: breadcrumbs } });
          setSubmitting(false);
        }, 1000);
      })
      .catch((err) => {
        message.error("Internal Server Error");
        setSubmitting(false);
        console.error(err);
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      api.get(`/data/${data_id}`).then((res) => {
        setLoading(false);
        setSubmitting(false);
        setForms(res.data);
        const photos = res.data.forms.question_group
          .map((x) => x.question)
          .flatMap((x) => x)
          .filter((x) => x.type === "photo")
          .map((x) => ({
            text: x.name,
            url: res.data.initial_value.find((i) => i.question === x.id)?.value,
          }))
          .filter((x) => x.url);
        setImages(photos);
      });
    }
  }, [data_id, isLoggedIn]);

  return (
    <div id="dataview" className="main">
      <Loading isLoading={loading} />
      {!loading && (
        <Row className="content-container">
          <Col span={24}>
            <div className="content">
              {!!images.length && (
                <Carousel dots={{ className: "carousel-dots" }} autoplay>
                  {images.map((i, ix) => (
                    <div key={`image-${ix}`} className="carousel-data">
                      <Row
                        type="flex"
                        justify="center"
                        align="middle"
                        className="carousel-image"
                      >
                        <Image src={i.url} />
                      </Row>
                      <div className="carousel-text">
                        <p>{i.text}</p>
                      </div>
                    </div>
                  ))}
                </Carousel>
              )}
              <Webform
                onFinish={onFinish}
                forms={forms.forms}
                initialValue={forms.initial_value}
                sidebar={true}
                submitButtonSetting={{
                  loading: submitting,
                  disabled: routeState?.previewOnly
                    ? routeState.previewOnly
                    : submitting,
                }}
              />
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default DataViews;
