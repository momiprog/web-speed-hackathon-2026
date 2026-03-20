import { IntersectionRender } from "@web-speed-hackathon-2026/client/src/components/foundation/IntersectionRender";
import { TimelineItem } from "@web-speed-hackathon-2026/client/src/components/timeline/TimelineItem";

interface Props {
  timeline: Models.Post[];
}

export const Timeline = ({ timeline }: Props) => {
  return (
    <section>
      {timeline.map((post, index) => {
        return (
          <IntersectionRender key={post.id} height="100px">
            <TimelineItem post={post} isPriority={index === 0} />
          </IntersectionRender>
        );
      })}
    </section>
  );
};
